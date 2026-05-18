import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lightweight in-memory cache
const analysisCache = new Map<string, { result: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Initialize AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Optimized Repository Analysis Endpoint
app.post("/api/analyze/stream", async (req, res) => {
  const { repoUrl } = req.body;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const headers = { 
    'User-Agent': 'GitPilotAI-Analyzer',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (!repoUrl) {
    send({ error: "Repo URL required", status: "Error" });
    return res.end();
  }

  try {
    const [owner, repo] = repoUrl.replace("https://github.com/", "").split("/").slice(0, 2);
    if (!owner || !repo) {
      send({ error: "Invalid GitHub URL", status: "Error" });
      return res.end();
    }

    const cacheKey = `${owner}/${repo}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Serving cached analysis for ${cacheKey}`);
      send({ ...cached.result, status: "Complete" });
      return res.end();
    }

    // PHASE 1: Fetch Metadata & Tree
    send({ status: "Fetching repository metadata..." });
    const repoMetadataUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;

    const [metaRes, treeRes] = await Promise.all([
      axios.get(repoMetadataUrl, { headers, timeout: 5000 }).catch(e => { console.error("Meta Fetch Error:", e.message); return null; }),
      axios.get(treeUrl, { headers, timeout: 5000 }).catch(e => { console.error("Tree Fetch Error:", e.message); return { data: [] }; })
    ]);

    const meta = metaRes?.data;
    const tree = Array.isArray(treeRes.data) ? treeRes.data.map((f: any) => ({ path: f.path, type: f.type })) : [];
    
    const initialInfo = {
      name: meta?.name || repo,
      stats: meta ? `${((meta.stargazers_count || 0) / 1000).toFixed(1)}k stars, ${meta.forks_count || 0} forks` : "Public Repo",
      language: meta?.language || "Mixed",
      status: "Reading README..."
    };
    send(initialInfo);

    // PHASE 2: Fetch Critical Files
    const essentialFiles = ["README.md", "package.json", "tsconfig.json", "vite.config.ts"];
    const fileResponses = await Promise.all(
      essentialFiles.map(file => 
        axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers, timeout: 5000 })
          .then(r => Buffer.from(r.data.content, 'base64').toString('utf8'))
          .catch(() => null)
      )
    );

    const fileContents: Record<string, string> = {};
    essentialFiles.forEach((name, i) => {
      if (fileResponses[i]) fileContents[name] = fileResponses[i]!;
    });

    // PHASE 3: AI Analysis (Sequential steps for better progressive feel)
    
    // Step A: Summary
    send({ status: "Analyzing codebase purpose..." });
    const summaryPrompt = `
      Project: ${owner}/${repo}
      Language: ${initialInfo.language}
      README Context: ${fileContents["README.md"]?.substring(0, 500) || "N/A"}
      
      Task: Summarize this project in exactly one clear, high-level sentence.
      JSON Format: {"description": "summary"}
    `;

    let description = "A GitHub repository.";
    try {
      const summaryAiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: summaryPrompt,
        config: { responseMimeType: "application/json" }
      });
      const summaryParsed = JSON.parse(summaryAiResponse.text);
      description = summaryParsed.description || description;
    } catch (e) {
      console.error("Summary AI Parse Error:", e);
    }
    send({ description, status: "Generating onboarding roadmap..." });

    // Step B: Roadmap, Files, and Risks
    const deepPrompt = `
      Project: ${owner}/${repo}
      Core Tree: ${tree.slice(0, 15).map((f: any) => f.path).join(", ")}
      Package Config: ${fileContents["package.json"]?.substring(0, 500) || "N/A"}
      
      Tasks:
      1. roadmap: 3-step beginner path (JSON: [{"step": "...", "detail": "max 12 words"}])
      2. importantFiles: 3 key files (JSON: [{"name": "path", "reason": "why"}])
      3. risks: 1 very concise sentence on complexity.
      
      JSON Format: {"roadmap": [], "importantFiles": [], "risks": ""}
    `;

    try {
      const deepAiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: deepPrompt,
        config: { responseMimeType: "application/json" }
      });

      const deepResult = JSON.parse(deepAiResponse.text);
      const finalResult = { 
        ...initialInfo, 
        description, 
        roadmap: deepResult.roadmap || [], 
        importantFiles: deepResult.importantFiles || [], 
        risks: deepResult.risks || "No major risks identified." 
      };
      
      // Save to cache
      analysisCache.set(cacheKey, { result: finalResult, timestamp: Date.now() });

      send({ ...deepResult, status: "Complete" });
    } catch (e) {
      console.error("Deep AI Parse Error:", e);
      send({ status: "Complete", risks: "Analysis completed with some sections skipped." });
    }
    res.end();

  } catch (error: any) {
    console.error("Stream Analysis Error:", error);
    send({ error: "Analysis failed", details: error.message, status: "Error" });
    res.end();
  }
});

// Original endpoint redirects to stream or kept for compatibility
app.post("/api/analyze", async (req, res) => {
  const { repoUrl, userId } = req.body;
  if (!repoUrl) return res.status(400).json({ error: "Repo URL required" });

  try {
    const [owner, repo] = repoUrl.replace("https://github.com/", "").split("/").slice(0, 2);
    if (!owner || !repo) return res.status(400).json({ error: "Invalid GitHub URL" });

    const cacheKey = `${owner}/${repo}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Serving cached analysis for ${cacheKey}`);
      return res.json(cached.result);
    }

    // 1. FAST GITHUB DATA FETCHING
    // Fetch critical files in parallel for speed
    const essentialFiles = [
      "README.md", 
      "package.json", 
      "tsconfig.json", 
      "vite.config.ts", 
      "src/main.tsx", 
      "src/App.tsx", 
      "src/index.ts", 
      "src/main.ts"
    ];
    
    // Get root tree for structure
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;
    
    const [treeResponse, ...fileResponses] = await Promise.all([
      axios.get(treeUrl, { timeout: 4000 }).catch(() => ({ data: [] })),
      ...essentialFiles.map(file => 
        axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { timeout: 4000 })
          .then(r => Buffer.from(r.data.content, 'base64').toString('utf8'))
          .catch(() => null)
      )
    ]);

    const tree = Array.isArray(treeResponse.data) 
      ? (treeResponse.data as any[]).map(f => ({ path: f.path, type: f.type }))
      : [];
      
    const fileContents: Record<string, string> = {};
    essentialFiles.forEach((name, i) => {
      if (fileResponses[i]) fileContents[name] = fileResponses[i]!;
    });

    // 2. CONCISE AI ANALYSIS
    const prompt = `
      Analyze this GitHub repository: ${owner}/${repo}
      
      Files found at root: ${tree.map(f => f.path).join(", ")}
      
      README (snippet): ${fileContents["README.md"]?.substring(0, 1000) || "N/A"}
      Package.json (snippet): ${fileContents["package.json"]?.substring(0, 1000) || "N/A"}
      Vite Config (snippet): ${fileContents["vite.config.ts"]?.substring(0, 500) || "N/A"}
      
      Role: Expert software architect onboarding a new developer.
      Task: Generate a high-speed, concise repository intelligence report.
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            description: { type: "STRING" },
            stats: { type: "STRING" },
            language: { type: "STRING" },
            roadmap: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  step: { type: "STRING" },
                  detail: { type: "STRING" }
                },
                required: ["step", "detail"]
              }
            },
            risks: { type: "STRING" },
            importantFiles: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  reason: { type: "STRING" }
                },
                required: ["name", "reason"]
              }
            }
          },
          required: ["name", "description", "stats", "language", "roadmap", "risks", "importantFiles"]
        }
      }
    });

    const analysisResult = JSON.parse(aiResponse.text);
    
    // Save to cache
    analysisCache.set(cacheKey, { result: analysisResult, timestamp: Date.now() });

    // We return the result, the client will save it to Firestore to maintain their existing logic if they want,
    // or we could save it here if we had firebase-admin.
    // For now, we return it to the client.
    res.json(analysisResult);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

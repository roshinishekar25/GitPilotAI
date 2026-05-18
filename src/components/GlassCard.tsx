import React, { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "blue" | "none";
  hover?: boolean;
}

export const GlassCard = ({ children, className, glow = "none", hover = true, ...props }: GlassCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={cn(
        "glass rounded-2xl p-6",
        glow === "purple" && "glow-purple",
        glow === "blue" && "glow-blue",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

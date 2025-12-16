'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface GameCardProps {
  children: ReactNode;
  className?: string;
}

export default function GameCard({ children, className = '' }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
      className={`
        relative overflow-hidden
        bg-gradient-to-b from-zinc-900 to-zinc-950
        border border-zinc-800/50
        rounded-3xl
        shadow-2xl shadow-black/50
        backdrop-blur-xl
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

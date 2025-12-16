'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import GameCard from './GameCard';
import Button from './Button';

interface LeaderboardEntry {
  _id: string;
  name: string;
  reactionTime: number;
  timestamp: string;
}

interface LeaderboardProps {
  highlightId?: string | null;
  onClose: () => void;
}

export default function Leaderboard({ highlightId, onClose }: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setScores(data.scores);
        } else {
          setError('Failed to load leaderboard');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [highlightId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <GameCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Back to Game
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full"
          />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">{error}</p>
          <p className="text-zinc-500 text-sm">Make sure MongoDB is running</p>
        </div>
      )}

      {!loading && !error && scores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-2">No scores yet!</p>
          <p className="text-zinc-500 text-sm">Be the first to submit a score</p>
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <div className="space-y-2">
          {scores.map((score, index) => {
            const isHighlighted = score._id === highlightId;
            const rank = index + 1;
            const emoji = getRankEmoji(rank);

            return (
              <motion.div
                key={score._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  flex items-center gap-4 p-3 rounded-xl transition-colors
                  ${isHighlighted 
                    ? 'bg-emerald-500/10 border border-emerald-500/30' 
                    : 'bg-zinc-800/30 hover:bg-zinc-800/50'
                  }
                `}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {emoji ? (
                    <span className="text-lg">{emoji}</span>
                  ) : (
                    <span className="text-zinc-500 text-sm font-medium">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isHighlighted ? 'text-emerald-400' : 'text-white'}`}>
                    {score.name}
                    {isHighlighted && (
                      <span className="ml-2 text-xs text-emerald-500">(You)</span>
                    )}
                  </p>
                </div>

                {/* Time */}
                <div className="text-right">
                  <p className={`font-mono font-bold ${isHighlighted ? 'text-emerald-400' : 'text-white'}`}>
                    {score.reactionTime}
                    <span className="text-zinc-500 text-sm ml-1">ms</span>
                  </p>
                </div>

                {/* Date */}
                <div className="w-16 text-right">
                  <p className="text-zinc-500 text-xs">
                    {formatTime(score.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats footer */}
      {!loading && !error && scores.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Top {scores.length} players</span>
            <span>
              Best: {scores[0]?.reactionTime}ms
            </span>
          </div>
        </div>
      )}
    </GameCard>
  );
}

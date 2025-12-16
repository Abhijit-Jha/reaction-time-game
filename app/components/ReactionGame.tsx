'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GameCard from './GameCard';
import Button from './Button';
import Leaderboard from './Leaderboard';
import SoundToggle from './SoundToggle';
import { playSound } from '@/lib/sounds';

type GameState = 'idle' | 'waiting' | 'trigger' | 'result' | 'early';

interface GameResult {
  reactionTime: number;
  message: string;
}

function getReactionMessage(time: number): string {
  if (time < 150) return "Superhuman! Are you a robot? 🤖";
  if (time < 200) return "Lightning fast! ⚡";
  if (time < 250) return "Incredible reflexes! 🔥";
  if (time < 300) return "Very quick! 💨";
  if (time < 350) return "Nice reaction! 👍";
  if (time < 400) return "Good job! 😊";
  if (time < 500) return "Not bad! Keep practicing 💪";
  return "Room for improvement! Try again 🎯";
}

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [result, setResult] = useState<GameResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittedScoreId, setSubmittedScoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearGameTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearGameTimeout();
  }, [clearGameTimeout]);

  const startGame = useCallback(() => {
    if (soundEnabled) playSound('click');
    setGameState('waiting');
    setResult(null);
    setSubmittedScoreId(null);
    setShowNameInput(false);
    
    // Random delay between 1.5 and 4 seconds
    const delay = Math.random() * 2500 + 1500;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('trigger');
      startTimeRef.current = performance.now();
      if (soundEnabled) playSound('trigger');
    }, delay);
  }, [soundEnabled]);

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      // Clicked too early
      clearGameTimeout();
      setGameState('early');
      if (soundEnabled) playSound('early');
    } else if (gameState === 'trigger') {
      // Valid click - calculate reaction time
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      const message = getReactionMessage(reactionTime);
      setResult({ reactionTime, message });
      setGameState('result');
      if (soundEnabled) playSound('success');
    }
  }, [gameState, soundEnabled, clearGameTimeout]);

  const resetGame = useCallback(() => {
    clearGameTimeout();
    setGameState('idle');
    setResult(null);
    setShowNameInput(false);
    if (soundEnabled) playSound('click');
  }, [soundEnabled, clearGameTimeout]);

  const handleSubmitScore = useCallback(async () => {
    if (!result) return;
    
    setShowNameInput(true);
  }, [result]);

  const submitToLeaderboard = useCallback(async () => {
    if (!result) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim() || 'Anonymous',
          reactionTime: result.reactionTime,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmittedScoreId(data.id);
        setShowLeaderboard(true);
        setShowNameInput(false);
        if (soundEnabled) playSound('success');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [result, playerName, soundEnabled]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
      {/* Sound Toggle */}
      <div className="absolute top-6 right-6">
        <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
      </div>

      {/* Leaderboard Toggle */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showLeaderboard ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Leaderboard 
              highlightId={submittedScoreId} 
              onClose={() => setShowLeaderboard(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            {/* Idle State */}
            {gameState === 'idle' && (
              <GameCard className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Reaction Test
                  </h1>
                  <p className="text-zinc-400 mb-8 text-lg">
                    Click when the screen turns green
                  </p>
                  <Button onClick={startGame} size="lg">
                    Start
                  </Button>
                </motion.div>
              </GameCard>
            )}

            {/* Waiting State */}
            {gameState === 'waiting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="cursor-pointer"
                onClick={handleClick}
              >
                <GameCard className="p-16 text-center">
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-4 h-4 rounded-full bg-amber-500/80 mb-6 shadow-lg shadow-amber-500/30" />
                    <p className="text-2xl text-zinc-300 font-medium">Wait…</p>
                  </motion.div>
                </GameCard>
              </motion.div>
            )}

            {/* Trigger State */}
            {gameState === 'trigger' && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="cursor-pointer"
                onClick={handleClick}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-emerald-500 rounded-3xl p-16 text-center shadow-2xl shadow-emerald-500/30"
                >
                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="text-5xl font-bold text-white tracking-tight"
                  >
                    NOW!
                  </motion.p>
                </motion.div>
              </motion.div>
            )}

            {/* Early Click State */}
            {gameState === 'early' && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/90 rounded-3xl p-12 text-center shadow-2xl shadow-red-500/30"
                >
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    Too early!
                  </motion.p>
                  <p className="text-red-100 mb-6">Wait for the green screen</p>
                  <Button onClick={resetGame} variant="secondary">
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Result State */}
            {gameState === 'result' && result && (
              <GameCard className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-zinc-400 text-sm uppercase tracking-wider mb-2">
                    Your reaction time
                  </p>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-6xl font-bold text-white mb-2 tracking-tight"
                  >
                    {result.reactionTime}
                    <span className="text-2xl text-zinc-400 ml-1">ms</span>
                  </motion.p>
                  <p className="text-lg text-zinc-300 mb-8">{result.message}</p>
                  
                  {showNameInput ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <input
                        type="text"
                        placeholder="Enter your name (optional)"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 mb-4"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitToLeaderboard();
                        }}
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowNameInput(false)}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitToLeaderboard}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex gap-3 justify-center">
                      <Button onClick={resetGame} variant="secondary">
                        Try Again
                      </Button>
                      {!submittedScoreId && (
                        <Button onClick={handleSubmitScore}>
                          Submit Score
                        </Button>
                      )}
                      {submittedScoreId && (
                        <Button onClick={() => setShowLeaderboard(true)} variant="secondary">
                          View Leaderboard
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </GameCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 text-zinc-600 text-sm"
      >
        Test your reflexes
      </motion.p>
    </div>
  );
}

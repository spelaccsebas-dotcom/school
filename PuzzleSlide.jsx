import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;

export default function Pong({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const gameRef = useRef({
    player: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    ai: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 3 },
    animationId: null,
  });

  const startGame = useCallback(() => {
    gameRef.current = {
      player: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ai: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 3 },
      animationId: null,
    };
    setScore({ player: 0, ai: 0 });
    setGameRunning(true);
    setGameOver(false);
  }, []);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top - PADDLE_HEIGHT / 2;
      game.player.y = Math.max(0, Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const gameLoop = () => {
      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(10, game.player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(CANVAS_WIDTH - 20, game.ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(game.ball.x - BALL_SIZE / 2, game.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);

      // Move ball
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Ball collision with top/bottom
      if (game.ball.y <= 0 || game.ball.y >= CANVAS_HEIGHT) {
        game.ball.dy *= -1;
      }

      // Ball collision with paddles
      if (
        game.ball.x <= 20 + BALL_SIZE / 2 &&
        game.ball.y >= game.player.y &&
        game.ball.y <= game.player.y + PADDLE_HEIGHT
      ) {
        game.ball.dx = Math.abs(game.ball.dx);
        game.ball.dy += (Math.random() - 0.5) * 2;
      }

      if (
        game.ball.x >= CANVAS_WIDTH - 20 - BALL_SIZE / 2 &&
        game.ball.y >= game.ai.y &&
        game.ball.y <= game.ai.y + PADDLE_HEIGHT
      ) {
        game.ball.dx = -Math.abs(game.ball.dx);
        game.ball.dy += (Math.random() - 0.5) * 2;
      }

      // Score
      if (game.ball.x < 0) {
        setScore(s => {
          const newScore = { ...s, ai: s.ai + 1 };
          if (newScore.ai >= 5) {
            setGameRunning(false);
            setGameOver(true);
          }
          return newScore;
        });
        game.ball.x = CANVAS_WIDTH / 2;
        game.ball.y = CANVAS_HEIGHT / 2;
        game.ball.dx = 4;
      }

      if (game.ball.x > CANVAS_WIDTH) {
        setScore(s => {
          const newScore = { ...s, player: s.player + 1 };
          if (newScore.player >= 5) {
            setGameRunning(false);
            setGameOver(true);
          }
          return newScore;
        });
        game.ball.x = CANVAS_WIDTH / 2;
        game.ball.y = CANVAS_HEIGHT / 2;
        game.ball.dx = -4;
      }

      // AI movement
      const aiTarget = game.ball.y - PADDLE_HEIGHT / 2;
      if (game.ai.y < aiTarget) {
        game.ai.y = Math.min(game.ai.y + 3, CANVAS_HEIGHT - PADDLE_HEIGHT);
      } else if (game.ai.y > aiTarget) {
        game.ai.y = Math.max(game.ai.y - 3, 0);
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(score.player, CANVAS_WIDTH / 4, 40);
      ctx.fillText(score.ai, (CANVAS_WIDTH / 4) * 3, 40);

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameRunning, score]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score.player >= 5 ? score.player * 100 : 0);
    }
  }, [gameOver, score, onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-8">
        <div className="text-purple-300">
          Jij: <span className="font-bold text-white text-xl">{score.player}</span>
        </div>
        <div className="text-pink-300">
          AI: <span className="font-bold text-white text-xl">{score.ai}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-purple-500/30 bg-slate-950"
        />

        {!gameRunning && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {gameOver && (
                <div className="text-2xl font-bold text-white mb-4">
                  {score.player >= 5 ? '🎉 Gewonnen!' : '😢 Verloren'}
                </div>
              )}
              <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Play className="w-4 h-4 mr-2" />
                {gameOver ? 'Opnieuw' : 'Start'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-sm">Beweeg je muis om de paddle te besturen</p>
    </div>
  );
}
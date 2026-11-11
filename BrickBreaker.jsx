import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_WIDTH = 35;
const BRICK_HEIGHT = 15;
const BRICK_GAP = 4;

export default function BrickBreaker({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 },
    bricks: [],
    animationId: null,
  });

  const initBricks = useCallback(() => {
    const bricks = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const offsetX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_GAP) - BRICK_GAP)) / 2;
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: offsetX + col * (BRICK_WIDTH + BRICK_GAP),
          y: 30 + row * (BRICK_HEIGHT + BRICK_GAP),
          alive: true,
          color: colors[row]
        });
      }
    }
    return bricks;
  }, []);

  const startGame = useCallback(() => {
    gameRef.current = {
      paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 },
      bricks: initBricks(),
      animationId: null,
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  }, [initBricks]);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - PADDLE_WIDTH / 2;
      game.paddle.x = Math.max(0, Math.min(x, CANVAS_WIDTH - PADDLE_WIDTH));
    };

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left - PADDLE_WIDTH / 2;
      game.paddle.x = Math.max(0, Math.min(x, CANVAS_WIDTH - PADDLE_WIDTH));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    const gameLoop = () => {
      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw paddle
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.roundRect(game.paddle.x, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
      ctx.fill();

      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw bricks
      game.bricks.forEach(brick => {
        if (brick.alive) {
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 3);
          ctx.fill();
        }
      });

      // Move ball
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Wall collision
      if (game.ball.x <= BALL_RADIUS || game.ball.x >= CANVAS_WIDTH - BALL_RADIUS) {
        game.ball.dx *= -1;
      }
      if (game.ball.y <= BALL_RADIUS) {
        game.ball.dy *= -1;
      }

      // Paddle collision
      if (
        game.ball.y >= CANVAS_HEIGHT - 20 - BALL_RADIUS &&
        game.ball.y <= CANVAS_HEIGHT - 20 &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + PADDLE_WIDTH
      ) {
        game.ball.dy = -Math.abs(game.ball.dy);
        const hitPos = (game.ball.x - game.paddle.x) / PADDLE_WIDTH - 0.5;
        game.ball.dx = hitPos * 6;
      }

      // Brick collision
      game.bricks.forEach(brick => {
        if (brick.alive &&
          game.ball.x >= brick.x &&
          game.ball.x <= brick.x + BRICK_WIDTH &&
          game.ball.y >= brick.y &&
          game.ball.y <= brick.y + BRICK_HEIGHT
        ) {
          brick.alive = false;
          game.ball.dy *= -1;
          setScore(s => s + 10);
        }
      });

      // Check win
      if (game.bricks.every(b => !b.alive)) {
        setGameRunning(false);
        setGameOver(true);
        return;
      }

      // Check lose
      if (game.ball.y >= CANVAS_HEIGHT) {
        setGameRunning(false);
        setGameOver(true);
        return;
      }

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameRunning]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score);
    }
  }, [gameOver, score, onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-purple-300">
        Score: <span className="font-bold text-white text-xl">{score}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border border-purple-500/30 bg-slate-900 touch-none"
        />

        {!gameRunning && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {gameOver && (
                <div className="text-2xl font-bold text-white mb-4">
                  Score: {score}
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

      <p className="text-slate-500 text-sm">Beweeg met je muis of vinger</p>
    </div>
  );
}
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const BIRD_SIZE = 24;
const PIPE_WIDTH = 50;
const PIPE_GAP = 140;
const GRAVITY = 0.4;
const JUMP_STRENGTH = -7;

export default function FlappyBird({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
    pipes: [],
    animationId: null,
    frameCount: 0,
  });

  const startGame = useCallback(() => {
    gameRef.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
      pipes: [],
      animationId: null,
      frameCount: 0,
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  }, []);

  const jump = useCallback(() => {
    if (gameRunning) {
      gameRef.current.bird.velocity = JUMP_STRENGTH;
    }
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const handleClick = () => jump();
    const handleKeyDown = (e) => {
      if (e.code === 'Space') jump();
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      game.frameCount++;

      // Clear
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Add pipes
      if (game.frameCount % 100 === 0) {
        const gapY = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
        game.pipes.push({ x: CANVAS_WIDTH, gapY, passed: false });
      }

      // Update bird
      game.bird.velocity += GRAVITY;
      game.bird.y += game.bird.velocity;

      // Draw bird
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(80, game.bird.y, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(86, game.bird.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(88, game.bird.y - 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw pipes
      game.pipes = game.pipes.filter(pipe => {
        pipe.x -= 3;

        // Draw pipes
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);

        // Pipe caps
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20);

        // Check collision
        if (
          80 + BIRD_SIZE / 2 > pipe.x &&
          80 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH &&
          (game.bird.y - BIRD_SIZE / 2 < pipe.gapY ||
           game.bird.y + BIRD_SIZE / 2 > pipe.gapY + PIPE_GAP)
        ) {
          setGameRunning(false);
          setGameOver(true);
          return false;
        }

        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 80) {
          pipe.passed = true;
          setScore(s => s + 1);
        }

        return pipe.x > -PIPE_WIDTH;
      });

      // Ground/ceiling collision
      if (game.bird.y < BIRD_SIZE / 2 || game.bird.y > CANVAS_HEIGHT - BIRD_SIZE / 2) {
        setGameRunning(false);
        setGameOver(true);
        return;
      }

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameRunning, jump]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score * 50);
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
          className="rounded-xl border border-purple-500/30 touch-none"
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

      <p className="text-slate-500 text-sm">Klik of druk op spatie om te springen</p>
    </div>
  );
}
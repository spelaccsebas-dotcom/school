import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const COLS = 8;
const ROWS = 10;
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

export default function BubbleShooter({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    grid: [],
    shooter: { x: 160, y: 420, angle: -90, color: 0 },
    bubble: null,
    animationId: null,
  });

  const initGrid = () => {
    const grid = [];
    for (let y = 0; y < 5; y++) {
      const row = [];
      for (let x = 0; x < COLS; x++) {
        row.push(Math.floor(Math.random() * COLORS.length));
      }
      grid.push(row);
    }
    return grid;
  };

  const startGame = () => {
    gameRef.current = {
      grid: initGrid(),
      shooter: { x: 160, y: 420, angle: -90, color: Math.floor(Math.random() * COLORS.length) },
      bubble: null,
      animationId: null,
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    const BUBBLE_SIZE = 20;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      game.shooter.angle = Math.atan2(y - game.shooter.y, x - game.shooter.x) * 180 / Math.PI;
    };

    const handleClick = () => {
      if (!game.bubble) {
        const rad = game.shooter.angle * Math.PI / 180;
        game.bubble = {
          x: game.shooter.x,
          y: game.shooter.y,
          vx: Math.cos(rad) * 5,
          vy: Math.sin(rad) * 5,
          color: game.shooter.color
        };
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const findMatches = (grid, row, col, color, visited = new Set()) => {
      const key = `${row},${col}`;
      if (
        row < 0 || row >= grid.length ||
        col < 0 || col >= COLS ||
        visited.has(key) ||
        grid[row][col] === null ||
        grid[row][col] !== color
      ) {
        return [];
      }

      visited.add(key);
      const matches = [{ row, col }];
      
      const neighbors = [
        [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1]
      ];
      
      neighbors.forEach(([r, c]) => {
        matches.push(...findMatches(grid, r, c, color, visited));
      });
      
      return matches;
    };

    const gameLoop = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 480);

      // Draw grid
      game.grid.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color !== null) {
            ctx.fillStyle = COLORS[color];
            ctx.beginPath();
            ctx.arc(x * 40 + 20, y * 40 + 20, BUBBLE_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      });

      // Draw shooter
      ctx.save();
      ctx.translate(game.shooter.x, game.shooter.y);
      ctx.rotate(game.shooter.angle * Math.PI / 180);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = COLORS[game.shooter.color];
      ctx.beginPath();
      ctx.arc(game.shooter.x, game.shooter.y, BUBBLE_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw bubble
      if (game.bubble) {
        game.bubble.x += game.bubble.vx;
        game.bubble.y += game.bubble.vy;

        // Wall bounce
        if (game.bubble.x < BUBBLE_SIZE || game.bubble.x > 320 - BUBBLE_SIZE) {
          game.bubble.vx *= -1;
        }

        // Check collision with grid
        const gridX = Math.floor(game.bubble.x / 40);
        const gridY = Math.floor(game.bubble.y / 40);

        if (gridY >= 0 && gridY < game.grid.length && gridX >= 0 && gridX < COLS) {
          if (game.grid[gridY][gridX] !== null || game.bubble.y < 40) {
            // Snap to grid
            game.grid[gridY][gridX] = game.bubble.color;
            
            // Check for matches
            const matches = findMatches(game.grid, gridY, gridX, game.bubble.color);
            if (matches.length >= 3) {
              matches.forEach(({ row, col }) => {
                game.grid[row][col] = null;
              });
              setScore(s => s + matches.length * 10);
            }

            game.bubble = null;
            game.shooter.color = Math.floor(Math.random() * COLORS.length);

            // Check game over
            if (game.grid[game.grid.length - 1].some(c => c !== null)) {
              setGameRunning(false);
              setGameOver(true);
              return;
            }
          }
        }

        if (game.bubble) {
          ctx.fillStyle = COLORS[game.bubble.color];
          ctx.beginPath();
          ctx.arc(game.bubble.x, game.bubble.y, BUBBLE_SIZE, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
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
          width={320}
          height={480}
          className="rounded-xl border border-purple-500/30 bg-slate-950"
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

      <p className="text-slate-500 text-sm">Richt en klik om te schieten</p>
    </div>
  );
}
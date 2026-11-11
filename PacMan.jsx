import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 320;
const CELL_SIZE = 20;
const COLS = 16;
const ROWS = 16;

const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export default function PacMan({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    player: { x: 1, y: 1, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0 },
    dots: [],
    ghosts: [],
    animationId: null,
    frameCount: 0,
  });

  const startGame = useCallback(() => {
    const dots = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE[y][x] === 0) dots.push({ x, y });
      }
    }

    gameRef.current = {
      player: { x: 1, y: 1, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0 },
      dots,
      ghosts: [
        { x: 14, y: 1, color: '#ef4444', dir: { x: -1, y: 0 } },
        { x: 1, y: 14, color: '#3b82f6', dir: { x: 1, y: 0 } },
        { x: 14, y: 14, color: '#ec4899', dir: { x: 0, y: -1 } }
      ],
      animationId: null,
      frameCount: 0,
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const dirs = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 }
      };
      if (dirs[e.key]) {
        e.preventDefault();
        gameRef.current.player.nextDir = dirs[e.key];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const canMove = (x, y) => {
      return x >= 0 && x < COLS && y >= 0 && y < ROWS && MAZE[y][x] !== 1;
    };

    const gameLoop = () => {
      game.frameCount++;

      if (game.frameCount % 8 === 0) {
        // Try to change direction
        const nextX = game.player.x + game.player.nextDir.x;
        const nextY = game.player.y + game.player.nextDir.y;
        if (canMove(nextX, nextY)) {
          game.player.dir = { ...game.player.nextDir };
        }

        // Move player
        const newX = game.player.x + game.player.dir.x;
        const newY = game.player.y + game.player.dir.y;
        if (canMove(newX, newY)) {
          game.player.x = newX;
          game.player.y = newY;
          game.player.mouth = (game.player.mouth + 0.2) % 1;

          // Collect dot
          const dotIndex = game.dots.findIndex(d => d.x === newX && d.y === newY);
          if (dotIndex !== -1) {
            game.dots.splice(dotIndex, 1);
            setScore(s => s + 10);
            
            if (game.dots.length === 0) {
              setGameRunning(false);
              setGameOver(true);
              return;
            }
          }
        }

        // Move ghosts
        game.ghosts.forEach(ghost => {
          const possibleDirs = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
          ].filter(dir => canMove(ghost.x + dir.x, ghost.y + dir.y));
          
          if (possibleDirs.length > 0) {
            ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
          }
          
          ghost.x += ghost.dir.x;
          ghost.y += ghost.dir.y;

          // Check collision
          if (ghost.x === game.player.x && ghost.y === game.player.y) {
            setGameRunning(false);
            setGameOver(true);
            return;
          }
        });
      }

      // Draw
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw maze
      ctx.fillStyle = '#1e40af';
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (MAZE[y][x] === 1) {
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Draw dots
      ctx.fillStyle = '#fbbf24';
      game.dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x * CELL_SIZE + CELL_SIZE / 2, dot.y * CELL_SIZE + CELL_SIZE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player
      const px = game.player.x * CELL_SIZE + CELL_SIZE / 2;
      const py = game.player.y * CELL_SIZE + CELL_SIZE / 2;
      const mouthAngle = game.player.mouth * 0.4;
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, CELL_SIZE / 2 - 2, mouthAngle, Math.PI * 2 - mouthAngle);
      ctx.lineTo(px, py);
      ctx.fill();

      // Draw ghosts
      game.ghosts.forEach(ghost => {
        const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(gx, gy, CELL_SIZE / 2 - 2, Math.PI, 0);
        ctx.lineTo(gx + CELL_SIZE / 2 - 2, gy + CELL_SIZE / 2);
        ctx.lineTo(gx - CELL_SIZE / 2 + 2, gy + CELL_SIZE / 2);
        ctx.closePath();
        ctx.fill();
      });

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
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

      <p className="text-slate-500 text-sm">Pijltjestoetsen om te bewegen</p>
    </div>
  );
}
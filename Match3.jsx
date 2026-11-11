import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;

export default function JumpGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, size: 30 },
    platforms: [],
    cameraY: 0,
    animationId: null,
  });

  const startGame = useCallback(() => {
    const platforms = [];
    for (let i = 0; i < 10; i++) {
      platforms.push({
        x: Math.random() * (CANVAS_WIDTH - 60),
        y: i * 60,
        width: 60,
        height: 10
      });
    }
    
    gameRef.current = {
      player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, vx: 0, vy: 0, size: 30 },
      platforms,
      cameraY: 0,
      highestY: CANVAS_HEIGHT - 100,
      animationId: null,
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  }, []);

  const jump = useCallback(() => {
    if (gameRunning) {
      const dx = Math.random() > 0.5 ? 3 : -3;
      gameRef.current.player.vx = dx;
    }
  }, [gameRunning]);

  useEffect(() => {
    const handleClick = () => jump();
    const handleKeyDown = (e) => {
      if (e.code === 'Space') jump();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [jump]);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const gameLoop = () => {
      // Apply gravity
      game.player.vy += 0.4;
      game.player.y += game.player.vy;
      game.player.x += game.player.vx;

      // Wrap horizontally
      if (game.player.x < 0) game.player.x = CANVAS_WIDTH;
      if (game.player.x > CANVAS_WIDTH) game.player.x = 0;

      // Camera follow
      if (game.player.y < CANVAS_HEIGHT / 2) {
        const diff = CANVAS_HEIGHT / 2 - game.player.y;
        game.player.y = CANVAS_HEIGHT / 2;
        game.cameraY += diff;
        
        game.platforms.forEach(p => p.y += diff);
        
        // Update score
        if (game.cameraY > game.highestY) {
          setScore(Math.floor(game.cameraY / 10));
          game.highestY = game.cameraY;
        }
      }

      // Check platform collision
      game.platforms.forEach(platform => {
        if (
          game.player.vy > 0 &&
          game.player.y + game.player.size / 2 >= platform.y &&
          game.player.y + game.player.size / 2 <= platform.y + platform.height + 5 &&
          game.player.x + game.player.size / 2 > platform.x &&
          game.player.x - game.player.size / 2 < platform.x + platform.width
        ) {
          game.player.vy = -10;
        }
      });

      // Add new platforms
      game.platforms = game.platforms.filter(p => p.y < CANVAS_HEIGHT + 50);
      while (game.platforms.length < 10) {
        game.platforms.push({
          x: Math.random() * (CANVAS_WIDTH - 60),
          y: game.platforms[game.platforms.length - 1].y - 60,
          width: 60,
          height: 10
        });
      }

      // Game over
      if (game.player.y > CANVAS_HEIGHT + 50) {
        setGameRunning(false);
        setGameOver(true);
        return;
      }

      // Clear
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw platforms
      game.platforms.forEach(platform => {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
      });

      // Draw player
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(game.player.x, game.player.y, game.player.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Face
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(game.player.x - 5, game.player.y - 3, 2, 0, Math.PI * 2);
      ctx.arc(game.player.x + 5, game.player.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(game.player.x, game.player.y + 2, 5, 0, Math.PI);
      ctx.stroke();

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Score: ${score}`, 10, 30);

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
    };
  }, [gameRunning, score]);

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
          className="rounded-xl border border-purple-500/30 cursor-pointer"
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

      <p className="text-slate-500 text-sm">Klik of druk spatie om te springen</p>
    </div>
  );
}
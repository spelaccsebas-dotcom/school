import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const LANE_WIDTH = 80;
const NUM_LANES = 3;

export default function RaceGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const gameRef = useRef({
    playerLane: 1,
    playerY: CANVAS_HEIGHT - 100,
    obstacles: [],
    roadOffset: 0,
    speed: 3,
    frameCount: 0,
    animationId: null,
  });

  const startGame = useCallback(() => {
    gameRef.current = {
      playerLane: 1,
      playerY: CANVAS_HEIGHT - 100,
      obstacles: [],
      roadOffset: 0,
      speed: 3,
      frameCount: 0,
      animationId: null,
    };
    setScore(0);
    setDistance(0);
    setGameRunning(true);
    setGameOver(false);
  }, []);

  const moveLeft = useCallback(() => {
    if (gameRunning && gameRef.current.playerLane > 0) {
      gameRef.current.playerLane--;
    }
  }, [gameRunning]);

  const moveRight = useCallback(() => {
    if (gameRunning && gameRef.current.playerLane < NUM_LANES - 1) {
      gameRef.current.playerLane++;
    }
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameRunning, moveLeft, moveRight]);

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const getLaneX = (lane) => {
      const startX = (CANVAS_WIDTH - NUM_LANES * LANE_WIDTH) / 2;
      return startX + lane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
    };

    const gameLoop = () => {
      game.frameCount++;

      // Increase speed gradually
      if (game.frameCount % 300 === 0) {
        game.speed = Math.min(game.speed + 0.5, 8);
      }

      // Update distance and score
      setDistance(d => d + 1);
      if (game.frameCount % 10 === 0) {
        setScore(s => s + 1);
      }

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw road
      const startX = (CANVAS_WIDTH - NUM_LANES * LANE_WIDTH) / 2;
      ctx.fillStyle = '#374151';
      ctx.fillRect(startX - 10, 0, NUM_LANES * LANE_WIDTH + 20, CANVAS_HEIGHT);

      // Draw lane lines
      game.roadOffset = (game.roadOffset + game.speed) % 40;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      
      for (let i = 1; i < NUM_LANES; i++) {
        const x = startX + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, -game.roadOffset);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Add obstacles
      if (game.frameCount % 80 === 0) {
        const lane = Math.floor(Math.random() * NUM_LANES);
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#ec4899'];
        game.obstacles.push({
          lane,
          y: -CAR_HEIGHT,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      // Update and draw obstacles
      game.obstacles = game.obstacles.filter(obstacle => {
        obstacle.y += game.speed;

        // Draw obstacle car
        const x = getLaneX(obstacle.lane);
        
        // Car body
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(x, obstacle.y, CAR_WIDTH, CAR_HEIGHT);
        
        // Windows
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 5, obstacle.y + 5, CAR_WIDTH - 10, 15);
        ctx.fillRect(x + 5, obstacle.y + 35, CAR_WIDTH - 10, 15);
        
        // Wheels
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 3, obstacle.y + 10, 6, 15);
        ctx.fillRect(x + CAR_WIDTH - 3, obstacle.y + 10, 6, 15);
        ctx.fillRect(x - 3, obstacle.y + 35, 6, 15);
        ctx.fillRect(x + CAR_WIDTH - 3, obstacle.y + 35, 6, 15);

        // Check collision
        if (
          obstacle.lane === game.playerLane &&
          obstacle.y + CAR_HEIGHT > game.playerY &&
          obstacle.y < game.playerY + CAR_HEIGHT
        ) {
          setGameRunning(false);
          setGameOver(true);
          return false;
        }

        return obstacle.y < CANVAS_HEIGHT + CAR_HEIGHT;
      });

      // Draw player car
      const playerX = getLaneX(game.playerLane);
      
      // Car body with gradient
      const carGradient = ctx.createLinearGradient(playerX, game.playerY, playerX, game.playerY + CAR_HEIGHT);
      carGradient.addColorStop(0, '#a855f7');
      carGradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = carGradient;
      ctx.fillRect(playerX, game.playerY, CAR_WIDTH, CAR_HEIGHT);
      
      // Windows
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(playerX + 5, game.playerY + 5, CAR_WIDTH - 10, 15);
      ctx.fillRect(playerX + 5, game.playerY + 35, CAR_WIDTH - 10, 15);
      
      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(playerX + 5, game.playerY + CAR_HEIGHT - 5, 10, 4);
      ctx.fillRect(playerX + CAR_WIDTH - 15, game.playerY + CAR_HEIGHT - 5, 10, 4);
      
      // Wheels
      ctx.fillStyle = '#000000';
      ctx.fillRect(playerX - 3, game.playerY + 10, 6, 15);
      ctx.fillRect(playerX + CAR_WIDTH - 3, game.playerY + 10, 6, 15);
      ctx.fillRect(playerX - 3, game.playerY + 35, 6, 15);
      ctx.fillRect(playerX + CAR_WIDTH - 3, game.playerY + 35, 6, 15);

      // Draw speed indicator
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 10, 100, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('AFSTAND', 20, 30);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(Math.floor(distance / 10) + 'm', 20, 55);

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
    };
  }, [gameRunning, distance]);

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
          className="rounded-xl border border-purple-500/30 touch-none"
        />

        {!gameRunning && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {gameOver && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-2">
                    Score: {score}
                  </div>
                  <div className="text-purple-300">
                    Afstand: {Math.floor(distance / 10)}m
                  </div>
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

      {/* Mobile controls */}
      <div className="flex gap-3 sm:hidden">
        <Button
          size="lg"
          onClick={moveLeft}
          disabled={!gameRunning}
          className="bg-slate-800 hover:bg-slate-700 border border-purple-500/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={moveRight}
          disabled={!gameRunning}
          className="bg-slate-800 hover:bg-slate-700 border border-purple-500/30"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>

      <p className="text-slate-500 text-sm hidden sm:block">Gebruik pijltjestoetsen om te sturen</p>
    </div>
  );
}
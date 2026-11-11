import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

export default function Asteroids({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const gameRef = useRef({
    ship: { x: 200, y: 200, angle: 0, vx: 0, vy: 0 },
    bullets: [],
    asteroids: [],
    keys: {}
  });

  useEffect(() => {
    if (!started || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Spawn asteroids
    for (let i = 0; i < 5; i++) {
      gameRef.current.asteroids.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 20
      });
    }

    const gameLoop = () => {
      const game = gameRef.current;
      const ship = game.ship;

      // Input
      if (game.keys.ArrowLeft) ship.angle -= 0.1;
      if (game.keys.ArrowRight) ship.angle += 0.1;
      if (game.keys.ArrowUp) {
        ship.vx += Math.cos(ship.angle) * 0.2;
        ship.vy += Math.sin(ship.angle) * 0.2;
      }

      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.x = (ship.x + 400) % 400;
      ship.y = (ship.y + 400) % 400;

      // Bullets
      game.bullets = game.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        return b.life > 0;
      });

      // Asteroids
      game.asteroids.forEach(ast => {
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.x = (ast.x + 400) % 400;
        ast.y = (ast.y + 400) % 400;

        // Collision with ship
        const dx = ship.x - ast.x;
        const dy = ship.y - ast.y;
        if (Math.sqrt(dx * dx + dy * dy) < ast.radius + 10) {
          setGameOver(true);
          onGameEnd && onGameEnd(score);
        }
      });

      // Bullet-asteroid collision
      game.bullets.forEach((b, bi) => {
        game.asteroids.forEach((ast, ai) => {
          const dx = b.x - ast.x;
          const dy = b.y - ast.y;
          if (Math.sqrt(dx * dx + dy * dy) < ast.radius) {
            game.bullets.splice(bi, 1);
            game.asteroids.splice(ai, 1);
            setScore(s => s + 10);
          }
        });
      });

      // Draw
      ctx.clearRect(0, 0, 400, 400);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 400, 400);

      // Ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-10, -7);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Bullets
      ctx.fillStyle = '#fff';
      game.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, 2, 2);
      });

      // Asteroids
      game.asteroids.forEach(ast => {
        ctx.strokeStyle = '#888';
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [started, gameOver, score, onGameEnd]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        const ship = gameRef.current.ship;
        gameRef.current.bullets.push({
          x: ship.x,
          y: ship.y,
          vx: Math.cos(ship.angle) * 5,
          vy: Math.sin(ship.angle) * 5,
          life: 50
        });
      }
    };

    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-xl">Score: {score}</div>
      <canvas ref={canvasRef} width={400} height={400} className="border-2 border-white" />
      {!started && <Button onClick={() => setStarted(true)}>Start</Button>}
      {gameOver && <div className="text-white">Game Over!</div>}
    </div>
  );
}
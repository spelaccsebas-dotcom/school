import React, { useState, useEffect, useRef } from 'react';

export default function TowerStack({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const gameRef = useRef({
    blocks: [{ x: 150, y: 450, width: 100 }],
    current: { x: 0, y: 400, width: 100, dir: 1 },
    speed: 2
  });

  useEffect(() => {
    if (!started || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gameLoop = () => {
      const game = gameRef.current;

      game.current.x += game.speed * game.current.dir;
      if (game.current.x < 0 || game.current.x + game.current.width > 400) {
        game.current.dir *= -1;
      }

      ctx.clearRect(0, 0, 400, 500);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 400, 500);

      // Draw blocks
      ctx.fillStyle = '#8b5cf6';
      game.blocks.forEach(block => {
        ctx.fillRect(block.x, block.y, block.width, 20);
      });

      // Draw current
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(game.current.x, game.current.y, game.current.width, 20);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [started, gameOver]);

  const dropBlock = () => {
    const game = gameRef.current;
    const lastBlock = game.blocks[game.blocks.length - 1];

    const overlap = Math.min(
      lastBlock.x + lastBlock.width,
      game.current.x + game.current.width
    ) - Math.max(lastBlock.x, game.current.x);

    if (overlap <= 0) {
      setGameOver(true);
      onGameEnd && onGameEnd(score);
      return;
    }

    const newBlock = {
      x: Math.max(lastBlock.x, game.current.x),
      y: game.current.y,
      width: overlap
    };

    game.blocks.push(newBlock);
    game.current = {
      x: newBlock.x,
      y: newBlock.y - 30,
      width: newBlock.width,
      dir: 1
    };

    setScore(score + 1);
    game.speed = Math.min(game.speed + 0.2, 8);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' && started && !gameOver) {
        e.preventDefault();
        dropBlock();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-xl font-bold">Score: {score}</div>
      <canvas ref={canvasRef} width={400} height={500} className="border-4 border-purple-500" />
      {!started && (
        <button onClick={() => setStarted(true)} className="px-4 py-2 bg-purple-600 text-white rounded">
          Start
        </button>
      )}
      {started && !gameOver && (
        <button onClick={dropBlock} className="px-4 py-2 bg-blue-600 text-white rounded">
          Drop (Spatie)
        </button>
      )}
      {gameOver && <div className="text-white">Game Over! Score: {score}</div>}
    </div>
  );
}
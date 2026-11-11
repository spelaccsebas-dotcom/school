import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, DollarSign } from 'lucide-react';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 400;

export default function TowerDefense({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const gameRef = useRef({
    towers: [],
    enemies: [],
    projectiles: [],
    path: [],
    animationId: null,
    frameCount: 0,
    selectedTile: null,
  });

  const PATH = [
    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
    { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
    { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
    { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 },
    { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 }
  ];

  const startGame = () => {
    gameRef.current = {
      towers: [],
      enemies: [],
      projectiles: [],
      path: PATH,
      animationId: null,
      frameCount: 0,
      selectedTile: null,
    };
    setGold(200);
    setLives(20);
    setWave(1);
    setGameRunning(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / 32);
      const y = Math.floor((e.clientY - rect.top) / 32);
      
      const isPath = game.path.some(p => p.x === x && p.y === y);
      const hasTower = game.towers.some(t => t.x === x && t.y === y);
      
      if (!isPath && !hasTower && gold >= 50) {
        game.towers.push({ x, y, range: 80, damage: 10, cooldown: 0 });
        setGold(g => g - 50);
      }
    };

    canvas.addEventListener('click', handleClick);

    const spawnEnemy = () => {
      game.enemies.push({
        pathIndex: 0,
        x: 0,
        y: 96,
        health: 50 + wave * 10,
        maxHealth: 50 + wave * 10,
        speed: 1,
        value: 20
      });
    };

    const gameLoop = () => {
      game.frameCount++;

      // Spawn enemies
      if (game.frameCount % 60 === 0 && game.enemies.length < wave * 5) {
        spawnEnemy();
      }

      // Next wave
      if (game.frameCount % 600 === 0) {
        setWave(w => w + 1);
      }

      // Clear
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw path
      ctx.fillStyle = '#92400e';
      game.path.forEach(p => {
        ctx.fillRect(p.x * 32, p.y * 32, 32, 32);
      });

      // Draw towers
      game.towers.forEach(tower => {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(tower.x * 32 + 8, tower.y * 32 + 8, 16, 16);
        
        if (tower.cooldown > 0) tower.cooldown--;

        // Find target
        let target = null;
        let minDist = tower.range;
        game.enemies.forEach(enemy => {
          const dist = Math.hypot(enemy.x - (tower.x * 32 + 16), enemy.y - (tower.y * 32 + 16));
          if (dist < minDist) {
            minDist = dist;
            target = enemy;
          }
        });

        // Shoot
        if (target && tower.cooldown === 0) {
          game.projectiles.push({
            x: tower.x * 32 + 16,
            y: tower.y * 32 + 16,
            target,
            damage: tower.damage
          });
          tower.cooldown = 30;
        }
      });

      // Update projectiles
      game.projectiles = game.projectiles.filter(proj => {
        const dx = proj.target.x - proj.x;
        const dy = proj.target.y - proj.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 5) {
          proj.target.health -= proj.damage;
          if (proj.target.health <= 0) {
            setGold(g => g + proj.target.value);
            game.enemies = game.enemies.filter(e => e !== proj.target);
          }
          return false;
        }
        
        proj.x += (dx / dist) * 5;
        proj.y += (dy / dist) * 5;
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        return true;
      });

      // Update enemies
      game.enemies.forEach(enemy => {
        const current = game.path[enemy.pathIndex];
        const next = game.path[enemy.pathIndex + 1];
        
        if (next) {
          const targetX = next.x * 32 + 16;
          const targetY = next.y * 32 + 16;
          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < enemy.speed) {
            enemy.pathIndex++;
          } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
          }
        } else {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameRunning(false);
              setGameOver(true);
            }
            return newLives;
          });
          game.enemies = game.enemies.filter(e => e !== enemy);
        }
        
        // Draw enemy
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 16);
        
        // Health bar
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - 8, enemy.y - 12, 16 * healthPercent, 2);
      });

      if (lives > 0) {
        game.animationId = requestAnimationFrame(gameLoop);
      }
    };

    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(game.animationId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameRunning, gold, lives, wave]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(wave * 100);
    }
  }, [gameOver, wave, onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="text-purple-300">
          Wave: <span className="font-bold text-white">{wave}</span>
        </div>
        <div className="text-yellow-300">
          <DollarSign className="w-4 h-4 inline" />
          <span className="font-bold text-white">{gold}</span>
        </div>
        <div className="text-red-300">
          ❤️ <span className="font-bold text-white">{lives}</span>
        </div>
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
                  Wave {wave} bereikt!
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

      <p className="text-slate-500 text-sm">Klik om torens te plaatsen (50 goud)</p>
    </div>
  );
}
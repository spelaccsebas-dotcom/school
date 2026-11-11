import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID = 20;
const CELL = 20;
const INIT_SNAKE1 = [{ x: 5, y: 10 }, { x: 4, y: 10 }];
const INIT_SNAKE2 = [{ x: 15, y: 10 }, { x: 16, y: 10 }];

const randomFood = (s1, s2) => {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (s1.some(s => s.x === pos.x && s.y === pos.y) || s2.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

export default function MultiplayerSnake({ onGameEnd }) {
  const [snake1, setSnake1] = useState(INIT_SNAKE1);
  const [snake2, setSnake2] = useState(INIT_SNAKE2);
  const [food, setFood] = useState({ x: 10, y: 5 });
  const [dir1, setDir1] = useState({ x: 1, y: 0 });
  const [dir2, setDir2] = useState({ x: -1, y: 0 });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(null);
  const [running, setRunning] = useState(false);

  const dir1Ref = useRef(dir1);
  const dir2Ref = useRef(dir2);
  const snake1Ref = useRef(snake1);
  const snake2Ref = useRef(snake2);
  const foodRef = useRef(food);
  const score1Ref = useRef(score1);
  const score2Ref = useRef(score2);

  useEffect(() => { dir1Ref.current = dir1; }, [dir1]);
  useEffect(() => { dir2Ref.current = dir2; }, [dir2]);
  useEffect(() => { snake1Ref.current = snake1; }, [snake1]);
  useEffect(() => { snake2Ref.current = snake2; }, [snake2]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { score1Ref.current = score1; }, [score1]);
  useEffect(() => { score2Ref.current = score2; }, [score2]);

  const handleKey = useCallback((e) => {
    const keyMap = {
      'ArrowUp': () => { if (dir1Ref.current.y !== 1) setDir1({ x: 0, y: -1 }); },
      'ArrowDown': () => { if (dir1Ref.current.y !== -1) setDir1({ x: 0, y: 1 }); },
      'ArrowLeft': () => { if (dir1Ref.current.x !== 1) setDir1({ x: -1, y: 0 }); },
      'ArrowRight': () => { if (dir1Ref.current.x !== -1) setDir1({ x: 1, y: 0 }); },
      'w': () => { if (dir2Ref.current.y !== 1) setDir2({ x: 0, y: -1 }); },
      's': () => { if (dir2Ref.current.y !== -1) setDir2({ x: 0, y: 1 }); },
      'a': () => { if (dir2Ref.current.x !== 1) setDir2({ x: -1, y: 0 }); },
      'd': () => { if (dir2Ref.current.x !== -1) setDir2({ x: 1, y: 0 }); },
    };
    if (keyMap[e.key]) { e.preventDefault(); keyMap[e.key](); }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const s1 = snake1Ref.current;
      const s2 = snake2Ref.current;
      const d1 = dir1Ref.current;
      const d2 = dir2Ref.current;
      const f = foodRef.current;

      const head1 = { x: (s1[0].x + d1.x + GRID) % GRID, y: (s1[0].y + d1.y + GRID) % GRID };
      const head2 = { x: (s2[0].x + d2.x + GRID) % GRID, y: (s2[0].y + d2.y + GRID) % GRID };

      const hitSelf1 = s1.some(s => s.x === head1.x && s.y === head1.y);
      const hitSelf2 = s2.some(s => s.x === head2.x && s.y === head2.y);
      const hitOther1 = s2.some(s => s.x === head1.x && s.y === head1.y);
      const hitOther2 = s1.some(s => s.x === head2.x && s.y === head2.y);

      if (hitSelf1 || hitOther1) { setGameOver('Speler 2 (WASD) wint! 🏆'); onGameEnd?.(score2Ref.current); setRunning(false); return; }
      if (hitSelf2 || hitOther2) { setGameOver('Speler 1 (Pijltjes) wint! 🏆'); onGameEnd?.(score1Ref.current); setRunning(false); return; }

      let newS1 = [head1, ...s1];
      let newS2 = [head2, ...s2];
      let newFood = f;

      if (head1.x === f.x && head1.y === f.y) {
        setScore1(p => p + 10);
        newFood = randomFood(newS1, newS2);
      } else { newS1 = newS1.slice(0, -1); }

      if (head2.x === newFood.x && head2.y === newFood.y) {
        setScore2(p => p + 10);
        newFood = randomFood(newS1, newS2);
      } else { newS2 = newS2.slice(0, -1); }

      setSnake1(newS1);
      setSnake2(newS2);
      setFood(newFood);
    }, 150);
    return () => clearInterval(interval);
  }, [running]);

  const reset = () => {
    setSnake1(INIT_SNAKE1); setSnake2(INIT_SNAKE2);
    setDir1({ x: 1, y: 0 }); setDir2({ x: -1, y: 0 });
    setFood({ x: 10, y: 5 }); setScore1(0); setScore2(0);
    setGameOver(null); setRunning(false);
  };

  const grid = Array(GRID).fill(null).map(() => Array(GRID).fill(null));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full text-sm">
        <span className="text-green-400 font-bold">🟢 Speler 1: {score1}</span>
        <span className="text-blue-400 font-bold">🔵 Speler 2: {score2}</span>
      </div>
      <div className="text-xs text-slate-400 text-center">Speler 1: Pijltjestoetsen | Speler 2: WASD</div>
      
      <div
        className="relative border border-slate-600 bg-slate-950"
        style={{ width: GRID * CELL, height: GRID * CELL }}
      >
        {/* Food */}
        <div className="absolute flex items-center justify-center text-base"
          style={{ left: food.x * CELL, top: food.y * CELL, width: CELL, height: CELL }}>🍎</div>
        {/* Snake 1 */}
        {snake1.map((s, i) => (
          <div key={i} className="absolute rounded-sm"
            style={{ left: s.x * CELL + 1, top: s.y * CELL + 1, width: CELL - 2, height: CELL - 2, background: i === 0 ? '#22c55e' : '#16a34a' }} />
        ))}
        {/* Snake 2 */}
        {snake2.map((s, i) => (
          <div key={i} className="absolute rounded-sm"
            style={{ left: s.x * CELL + 1, top: s.y * CELL + 1, width: CELL - 2, height: CELL - 2, background: i === 0 ? '#3b82f6' : '#1d4ed8' }} />
        ))}
      </div>

      {!running && !gameOver && (
        <button onClick={() => setRunning(true)} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">
          Start Spel
        </button>
      )}
      {gameOver && (
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg mb-2">{gameOver}</div>
          <button onClick={reset} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Opnieuw</button>
        </div>
      )}
    </div>
  );
}
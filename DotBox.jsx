import React, { useState } from 'react';

export default function DotBox({ onGameEnd }) {
  const [lines, setLines] = useState({ h: [], v: [] });
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [boxes, setBoxes] = useState([]);

  const SIZE = 4;

  const drawLine = (type, row, col) => {
    const key = `${row}-${col}`;
    if (lines[type].includes(key)) return;

    const newLines = { ...lines, [type]: [...lines[type], key] };
    setLines(newLines);

    const completedBoxes = checkBoxes(newLines);
    if (completedBoxes.length > 0) {
      setBoxes([...boxes, ...completedBoxes.map(b => ({ ...b, player: currentPlayer }))]);
      setScores({ ...scores, [currentPlayer]: scores[currentPlayer] + completedBoxes.length });
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'blue' : 'red');
    }

    if (lines.h.length + lines.v.length >= SIZE * (SIZE - 1) * 2) {
      const winner = scores.red > scores.blue ? 'red' : 'blue';
      onGameEnd && onGameEnd(scores[winner]);
    }
  };

  const checkBoxes = (currentLines) => {
    const completed = [];
    for (let r = 0; r < SIZE - 1; r++) {
      for (let c = 0; c < SIZE - 1; c++) {
        const top = `${r}-${c}`;
        const bottom = `${r + 1}-${c}`;
        const left = `${r}-${c}`;
        const right = `${r}-${c + 1}`;

        if (
          currentLines.h.includes(top) &&
          currentLines.h.includes(bottom) &&
          currentLines.v.includes(left) &&
          currentLines.v.includes(right) &&
          !boxes.find(b => b.r === r && b.c === c)
        ) {
          completed.push({ r, c });
        }
      }
    }
    return completed;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        Rood: {scores.red} | Blauw: {scores.blue}
      </div>
      <div className="text-white">
        Speler: <span className={currentPlayer === 'red' ? 'text-red-500' : 'text-blue-500'}>
          {currentPlayer === 'red' ? 'Rood' : 'Blauw'}
        </span>
      </div>

      <svg width="300" height="300">
        {[...Array(SIZE)].map((_, r) =>
          [...Array(SIZE)].map((_, c) => (
            <circle key={`dot-${r}-${c}`} cx={50 + c * 60} cy={50 + r * 60} r="4" fill="white" />
          ))
        )}

        {[...Array(SIZE)].map((_, r) =>
          [...Array(SIZE - 1)].map((_, c) => (
            <line
              key={`h-${r}-${c}`}
              x1={50 + c * 60}
              y1={50 + r * 60}
              x2={110 + c * 60}
              y2={50 + r * 60}
              stroke={lines.h.includes(`${r}-${c}`) ? currentPlayer : '#444'}
              strokeWidth="4"
              className="cursor-pointer"
              onClick={() => drawLine('h', r, c)}
            />
          ))
        )}

        {[...Array(SIZE - 1)].map((_, r) =>
          [...Array(SIZE)].map((_, c) => (
            <line
              key={`v-${r}-${c}`}
              x1={50 + c * 60}
              y1={50 + r * 60}
              x2={50 + c * 60}
              y2={110 + r * 60}
              stroke={lines.v.includes(`${r}-${c}`) ? currentPlayer : '#444'}
              strokeWidth="4"
              className="cursor-pointer"
              onClick={() => drawLine('v', r, c)}
            />
          ))
        )}

        {boxes.map((box, i) => (
          <rect
            key={i}
            x={52 + box.c * 60}
            y={52 + box.r * 60}
            width="56"
            height="56"
            fill={box.player === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}
          />
        ))}
      </svg>
    </div>
  );
}
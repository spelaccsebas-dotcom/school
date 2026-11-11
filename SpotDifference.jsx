import React, { useState } from 'react';

export default function SpotDifference({ onGameEnd }) {
  const [found, setFound] = useState([]);
  const differences = [
    { x: 100, y: 50 },
    { x: 200, y: 150 },
    { x: 150, y: 250 }
  ];

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    differences.forEach((diff, i) => {
      const dist = Math.sqrt((x - diff.x) ** 2 + (y - diff.y) ** 2);
      if (dist < 20 && !found.includes(i)) {
        const newFound = [...found, i];
        setFound(newFound);
        if (newFound.length === differences.length) {
          onGameEnd && onGameEnd(100);
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">
        Gevonden: {found.length}/{differences.length}
      </div>

      <div className="relative cursor-pointer bg-slate-800" onClick={handleClick}>
        <svg width="300" height="300">
          <circle cx="100" cy="100" r="40" fill="#8b5cf6" />
          <rect x="150" y="150" width="50" height="50" fill="#ec4899" />
          <circle cx="200" cy="80" r="30" fill="#3b82f6" />
          
          {differences.map((diff, i) => (
            found.includes(i) && (
              <circle key={i} cx={diff.x} cy={diff.y} r="25" fill="none" stroke="#22c55e" strokeWidth="3" />
            )
          ))}
        </svg>
      </div>

      {found.length === differences.length && (
        <div className="text-white text-xl font-bold">🎉 Allemaal gevonden!</div>
      )}
    </div>
  );
}
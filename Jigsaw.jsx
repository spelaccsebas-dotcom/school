import React, { useState, useEffect } from 'react';

export default function Jigsaw({ onGameEnd }) {
  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    setPieces([0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5));
  }, []);

  const handleDragStart = (e, index) => {
    setDragging(index);
  };

  const handleDrop = (e, position) => {
    e.preventDefault();
    if (dragging === null) return;

    const newBoard = [...board];
    newBoard[position] = pieces[dragging];
    setBoard(newBoard);

    const newPieces = pieces.filter((_, i) => i !== dragging);
    setPieces(newPieces);
    setDragging(null);

    if (newPieces.length === 0) {
      const solved = newBoard.every((val, i) => val === i);
      if (solved) {
        onGameEnd && onGameEnd(100);
      }
    }
  };

  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">Sleep de stukken naar de juiste plek</div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((piece, i) => (
          <div
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
            className="w-20 h-20 border-2 border-slate-600 rounded flex items-center justify-center"
            style={{ backgroundColor: piece !== null ? colors[piece] : '#1e293b' }}
          >
            {piece !== null && piece + 1}
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {pieces.map((piece, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            className="w-16 h-16 rounded cursor-move flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: colors[piece] }}
          >
            {piece + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
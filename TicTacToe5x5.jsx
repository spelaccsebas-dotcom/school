import React, { useState } from 'react';

export default function TicTacToe5x5({ onGameEnd }) {
  const [board, setBoard] = useState(Array(25).fill(null));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      // Horizontals
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Verticals
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    for (let line of lines) {
      const [a, b, c, d, e] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d] && squares[a] === squares[e]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = isX ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      onGameEnd && onGameEnd(gameWinner === 'X' ? 100 : 0);
    } else {
      setIsX(!isX);
    }
  };

  const resetGame = () => {
    setBoard(Array(25).fill(null));
    setIsX(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">
        {winner ? `${winner} wint!` : `Speler ${isX ? 'X' : 'O'} aan zet`}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-white text-2xl cursor-pointer hover:bg-slate-600"
          >
            {cell}
          </div>
        ))}
      </div>

      {winner && (
        <button onClick={resetGame} className="px-4 py-2 bg-purple-600 text-white rounded">
          Opnieuw
        </button>
      )}
    </div>
  );
}
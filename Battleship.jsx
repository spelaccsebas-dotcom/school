import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function Battleship({ onGameEnd }) {
  const [playerBoard, setPlayerBoard] = useState(initBoard());
  const [computerBoard, setComputerBoard] = useState(initBoard());
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [hits, setHits] = useState(0);

  function initBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill({ hit: false, ship: false }));
    // Place ships randomly
    for (let i = 0; i < 5; i++) {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * 8);
        const col = Math.floor(Math.random() * 8);
        if (!board[row][col].ship) {
          board[row][col] = { hit: false, ship: true };
          placed = true;
        }
      }
    }
    return board;
  }

  const handleClick = (row, col) => {
    if (!gameStarted || !playerTurn || winner || computerBoard[row][col].hit) return;

    const newBoard = computerBoard.map(r => [...r]);
    newBoard[row][col] = { ...newBoard[row][col], hit: true };
    setComputerBoard(newBoard);

    if (newBoard[row][col].ship) {
      const newHits = hits + 1;
      setHits(newHits);
      if (newHits === 5) {
        setWinner('player');
        onGameEnd && onGameEnd(newHits);
      }
    }

    setPlayerTurn(false);
    setTimeout(() => computerTurn(), 500);
  };

  const computerTurn = () => {
    let row, col;
    do {
      row = Math.floor(Math.random() * 8);
      col = Math.floor(Math.random() * 8);
    } while (playerBoard[row][col].hit);

    const newBoard = playerBoard.map(r => [...r]);
    newBoard[row][col] = { ...newBoard[row][col], hit: true };
    setPlayerBoard(newBoard);

    const computerHits = newBoard.flat().filter(cell => cell.hit && cell.ship).length;
    if (computerHits === 5) {
      setWinner('computer');
      onGameEnd && onGameEnd(0);
    } else {
      setPlayerTurn(true);
    }
  };

  const resetGame = () => {
    setPlayerBoard(initBoard());
    setComputerBoard(initBoard());
    setGameStarted(false);
    setWinner(null);
    setHits(0);
    setPlayerTurn(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">
        {winner ? (winner === 'player' ? '🎉 Je wint!' : '💥 Computer wint!') : `Jouw schepen geraakt: ${hits}/5`}
      </div>

      {!gameStarted ? (
        <Button onClick={() => setGameStarted(true)} className="bg-purple-600">
          Start Spel
        </Button>
      ) : (
        <div className="grid grid-cols-8 gap-1">
          {computerBoard.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => handleClick(i, j)}
                className={`w-8 h-8 border border-slate-600 cursor-pointer ${
                  cell.hit ? (cell.ship ? 'bg-red-500' : 'bg-slate-700') : 'bg-blue-500'
                }`}
              >
                {cell.hit && (cell.ship ? '💥' : '◦')}
              </div>
            ))
          )}
        </div>
      )}

      {winner && (
        <Button onClick={resetGame} className="bg-purple-600">
          Opnieuw
        </Button>
      )}
    </div>
  );
}
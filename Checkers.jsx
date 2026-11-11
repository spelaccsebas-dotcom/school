import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function Checkers({ onGameEnd }) {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);

  function initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'black', king: false };
        }
      }
    }
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'red', king: false };
        }
      }
    }
    return board;
  }

  const handleSquareClick = (row, col) => {
    if (winner) return;

    if (selectedPiece) {
      const [selectedRow, selectedCol] = selectedPiece;
      if (isValidMove(selectedRow, selectedCol, row, col)) {
        makeMove(selectedRow, selectedCol, row, col);
      }
      setSelectedPiece(null);
    } else if (board[row][col] && board[row][col].player === currentPlayer) {
      setSelectedPiece([row, col]);
    }
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    if (board[toRow][toCol]) return false;
    const piece = board[fromRow][fromCol];
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    if (colDiff !== Math.abs(rowDiff)) return false;

    if (!piece.king) {
      if (piece.player === 'red' && rowDiff > 0) return false;
      if (piece.player === 'black' && rowDiff < 0) return false;
    }

    if (Math.abs(rowDiff) === 1) return true;
    if (Math.abs(rowDiff) === 2) {
      const middleRow = (fromRow + toRow) / 2;
      const middleCol = (fromCol + toCol) / 2;
      const middlePiece = board[middleRow][middleCol];
      return middlePiece && middlePiece.player !== piece.player;
    }

    return false;
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    if (Math.abs(toRow - fromRow) === 2) {
      const middleRow = (fromRow + toRow) / 2;
      const middleCol = (fromCol + toCol) / 2;
      newBoard[middleRow][middleCol] = null;
    }

    if ((piece.player === 'red' && toRow === 0) || (piece.player === 'black' && toRow === 7)) {
      piece.king = true;
    }

    setBoard(newBoard);
    
    const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';
    const hasNextMoves = checkForMoves(newBoard, nextPlayer);
    
    if (!hasNextMoves) {
      setWinner(currentPlayer);
      onGameEnd && onGameEnd(1);
    } else {
      setCurrentPlayer(nextPlayer);
    }
  };

  const checkForMoves = (board, player) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] && board[row][col].player === player) {
          for (let newRow = 0; newRow < 8; newRow++) {
            for (let newCol = 0; newCol < 8; newCol++) {
              if (isValidMove(row, col, newRow, newCol)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setCurrentPlayer('red');
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-lg font-semibold">
        {winner ? `${winner === 'red' ? 'Rood' : 'Zwart'} wint!` : `${currentPlayer === 'red' ? 'Rood' : 'Zwart'} aan zet`}
      </div>
      
      <div className="grid grid-cols-8 gap-0 border-2 border-slate-700">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isSelected = selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex;
            const isDark = (rowIndex + colIndex) % 2 === 1;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`w-10 h-10 flex items-center justify-center cursor-pointer ${
                  isDark ? 'bg-amber-700' : 'bg-amber-200'
                } ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {piece && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    piece.player === 'red' ? 'bg-red-500' : 'bg-slate-800'
                  } border-2 border-slate-900`}>
                    {piece.king && <span className="text-yellow-400 text-xl">♔</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
        Nieuw Spel
      </Button>
    </div>
  );
}
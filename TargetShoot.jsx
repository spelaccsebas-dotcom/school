import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Eraser } from 'lucide-react';

export default function Sudoku({ onGameEnd }) {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  const isValid = (board, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  };

  const solveSudoku = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const generateSudoku = useCallback(() => {
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    
    for (let i = 0; i < 20; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const num = Math.floor(Math.random() * 9) + 1;
      if (isValid(newBoard, row, col, num)) {
        newBoard[row][col] = num;
      }
    }

    const solved = newBoard.map(row => [...row]);
    solveSudoku(solved);
    setSolution(solved);

    const puzzle = solved.map(row => [...row]);
    let cellsToRemove = 40;
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        cellsToRemove--;
      }
    }

    setBoard(puzzle.map(row => row.map(cell => ({ value: cell, fixed: cell !== 0 }))));
    setSelected(null);
    setMistakes(0);
    setCompleted(false);
  }, []);

  useEffect(() => {
    generateSudoku();
  }, [generateSudoku]);

  const handleCellClick = (row, col) => {
    if (!board[row][col].fixed && !completed) {
      setSelected({ row, col });
    }
  };

  const handleNumberClick = (num) => {
    if (!selected || completed) return;
    
    const { row, col } = selected;
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].value = num;
    setBoard(newBoard);

    if (num !== solution[row][col]) {
      setMistakes(m => m + 1);
    }

    const isComplete = newBoard.every((row, r) =>
      row.every((cell, c) => cell.value === solution[r][c])
    );

    if (isComplete) {
      setCompleted(true);
      onGameEnd(Math.max(1000 - mistakes * 50, 100));
    }
  };

  const handleErase = () => {
    if (!selected || completed || board[selected.row][selected.col].fixed) return;
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[selected.row][selected.col].value = 0;
    setBoard(newBoard);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-purple-300">
          Fouten: <span className="font-bold text-white">{mistakes}</span>
        </div>
        <Button onClick={generateSudoku} variant="outline" size="sm" className="border-purple-500/30">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw
        </Button>
      </div>

      <div className="bg-slate-900/80 p-3 rounded-xl border border-purple-500/30">
        <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <motion.button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                whileHover={{ scale: cell.fixed ? 1 : 1.05 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-bold text-sm
                  ${cell.fixed ? 'bg-slate-700 text-white' : 'bg-slate-800 text-purple-300'}
                  ${selected?.row === r && selected?.col === c ? 'ring-2 ring-purple-500' : ''}
                  ${(c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-purple-500/50' : ''}
                  ${(r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-purple-500/50' : ''}
                `}
              >
                {cell.value !== 0 ? cell.value : ''}
              </motion.button>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center max-w-sm">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={!selected || completed}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-purple-500/30"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={handleErase}
          disabled={!selected || completed}
          className="w-10 h-10 bg-red-600 hover:bg-red-700"
        >
          <Eraser className="w-4 h-4" />
        </Button>
      </div>

      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xl font-bold text-green-400"
        >
          <Trophy className="w-6 h-6" />
          Voltooid!
        </motion.div>
      )}
    </div>
  );
}
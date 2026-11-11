import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

const WORDS = ['CODE', 'WEB', 'APP', 'DATA', 'JAVA', 'HTML', 'CSS'];
const GRID_SIZE = 10;

export default function WordSearch({ onGameEnd }) {
  const [grid, setGrid] = useState([]);
  const [found, setFound] = useState(new Set());
  const [selecting, setSelecting] = useState([]);
  const [wordPositions, setWordPositions] = useState({});

  const generateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill('').map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );
    const positions = {};

    WORDS.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        let row = Math.floor(Math.random() * GRID_SIZE);
        let col = Math.floor(Math.random() * GRID_SIZE);
        
        let canPlace = true;
        const wordPositions = [];
        
        for (let i = 0; i < word.length; i++) {
          let r = row, c = col;
          
          if (direction === 0) c += i;
          else if (direction === 1) r += i;
          else { r += i; c += i; }
          
          if (r >= GRID_SIZE || c >= GRID_SIZE) {
            canPlace = false;
            break;
          }
          wordPositions.push([r, c]);
        }
        
        if (canPlace) {
          wordPositions.forEach(([r, c], i) => {
            newGrid[r][c] = word[i];
          });
          positions[word] = wordPositions;
          placed = true;
        }
        attempts++;
      }
    });

    setGrid(newGrid);
    setWordPositions(positions);
    setFound(new Set());
    setSelecting([]);
  }, []);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const handleCellClick = (row, col) => {
    const newSelecting = [...selecting, [row, col]];
    setSelecting(newSelecting);
    
    const selectedWord = newSelecting.map(([r, c]) => grid[r][c]).join('');
    
    if (WORDS.includes(selectedWord) && !found.has(selectedWord)) {
      setFound(new Set([...found, selectedWord]));
      setSelecting([]);
      
      if (found.size + 1 === WORDS.length) {
        setTimeout(() => onGameEnd(1000), 500);
      }
    }
  };

  const isSelected = (row, col) => {
    return selecting.some(([r, c]) => r === row && c === col);
  };

  const isFound = (row, col) => {
    return Array.from(found).some(word => {
      const positions = wordPositions[word] || [];
      return positions.some(([r, c]) => r === row && c === col);
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="text-purple-300">
          Gevonden: <span className="font-bold text-white">{found.size}/{WORDS.length}</span>
        </div>
        <Button onClick={generateGrid} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw
        </Button>
      </div>

      <div className="bg-slate-900/50 p-3 rounded-xl border border-purple-500/20">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseDown={() => setSelecting([[rowIndex, colIndex]])}
                onMouseEnter={() => selecting.length > 0 && handleCellClick(rowIndex, colIndex)}
                onMouseUp={() => setSelecting([])}
                whileHover={{ scale: 1.1 }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-sm transition-all ${
                  isFound(rowIndex, colIndex)
                    ? 'bg-green-500 text-white'
                    : isSelected(rowIndex, colIndex)
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {letter}
              </motion.button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {WORDS.map(word => (
          <div
            key={word}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              found.has(word)
                ? 'bg-green-500/20 text-green-400 line-through'
                : 'bg-purple-500/20 text-purple-300'
            }`}
          >
            {word}
          </div>
        ))}
      </div>

      {found.size === WORDS.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xl font-bold text-green-400"
        >
          <Trophy className="w-6 h-6" />
          Alle woorden gevonden!
        </motion.div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';

const EMOJIS = ['🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎸', '🎹'];

export default function FindPair({ onGameEnd }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const deck = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(deck);
  }, []);

  const handleClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          onGameEnd && onGameEnd(Math.max(0, 200 - moves * 5));
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">Zetten: {moves}</div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`w-16 h-20 rounded-lg flex items-center justify-center text-3xl cursor-pointer transition-all ${
              flipped.includes(i) || matched.includes(i)
                ? 'bg-white'
                : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}
          >
            {(flipped.includes(i) || matched.includes(i)) && card}
          </div>
        ))}
      </div>

      {matched.length === cards.length && (
        <div className="text-white text-xl">
          Gelukt in {moves} zetten!
        </div>
      )}
    </div>
  );
}
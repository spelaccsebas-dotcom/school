import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function Solitaire({ onGameEnd }) {
  const [deck, setDeck] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);

  const createDeck = () => {
    const cards = [];
    SUITS.forEach((suit, suitIndex) => {
      VALUES.forEach((value, valueIndex) => {
        cards.push({
          suit,
          value,
          suitIndex,
          valueIndex,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
          faceUp: false
        });
      });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const startGame = useCallback(() => {
    const cards = createDeck();
    const newTableau = [[], [], [], [], [], [], []];
    
    let cardIndex = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = cards[cardIndex++];
        card.faceUp = row === col;
        newTableau[col].push(card);
      }
    }

    setTableau(newTableau);
    setDeck(cards.slice(cardIndex));
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelected(null);
    setMoves(0);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const drawCard = () => {
    if (deck.length > 0) {
      const card = { ...deck[0], faceUp: true };
      setWaste([card, ...waste]);
      setDeck(deck.slice(1));
      setMoves(m => m + 1);
    } else {
      setDeck(waste.map(c => ({ ...c, faceUp: false })).reverse());
      setWaste([]);
    }
  };

  const canPlaceOnTableau = (card, pile) => {
    if (pile.length === 0) return card.valueIndex === 12; // Only K on empty
    const topCard = pile[pile.length - 1];
    return card.color !== topCard.color && card.valueIndex === topCard.valueIndex - 1;
  };

  const canPlaceOnFoundation = (card, foundation) => {
    if (foundation.length === 0) return card.valueIndex === 0; // Only A on empty
    const topCard = foundation[foundation.length - 1];
    return card.suitIndex === topCard.suitIndex && card.valueIndex === topCard.valueIndex + 1;
  };

  const handleCardClick = (card, source, sourceIndex) => {
    if (!card.faceUp) return;

    if (selected) {
      // Try to place selected card
      if (source === 'tableau') {
        if (canPlaceOnTableau(selected.card, tableau[sourceIndex])) {
          moveCard(selected, { type: 'tableau', index: sourceIndex });
        }
      } else if (source === 'foundation') {
        if (canPlaceOnFoundation(selected.card, foundations[sourceIndex])) {
          moveCard(selected, { type: 'foundation', index: sourceIndex });
        }
      }
      setSelected(null);
    } else {
      setSelected({ card, source, sourceIndex });
    }
  };

  const moveCard = (from, to) => {
    setMoves(m => m + 1);
    
    // Remove from source
    if (from.source === 'waste') {
      setWaste(waste.slice(1));
    } else if (from.source === 'tableau') {
      const newTableau = [...tableau];
      newTableau[from.sourceIndex].pop();
      if (newTableau[from.sourceIndex].length > 0) {
        newTableau[from.sourceIndex][newTableau[from.sourceIndex].length - 1].faceUp = true;
      }
      setTableau(newTableau);
    }

    // Add to destination
    if (to.type === 'tableau') {
      const newTableau = [...tableau];
      newTableau[to.index].push(from.card);
      setTableau(newTableau);
    } else if (to.type === 'foundation') {
      const newFoundations = [...foundations];
      newFoundations[to.index].push(from.card);
      setFoundations(newFoundations);
      
      // Check win
      if (newFoundations.every(f => f.length === 13)) {
        setTimeout(() => onGameEnd(Math.max(1000 - moves * 5, 100)), 500);
      }
    }
  };

  const renderCard = (card, onClick) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`w-12 h-16 rounded border-2 flex items-center justify-center text-sm font-bold cursor-pointer
        ${card.faceUp 
          ? `bg-white ${card.color === 'red' ? 'text-red-600' : 'text-black'} border-slate-300` 
          : 'bg-blue-600 border-blue-700'
        }
        ${selected?.card === card ? 'ring-2 ring-yellow-400' : ''}
      `}
    >
      {card.faceUp ? `${card.value}${card.suit}` : ''}
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <div className="flex items-center justify-between w-full">
        <div className="text-purple-300">
          Zetten: <span className="font-bold text-white">{moves}</span>
        </div>
        <Button onClick={startGame} variant="outline" size="sm" className="border-purple-500/30">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw
        </Button>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/20 w-full">
        {/* Top row */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <div onClick={drawCard} className="w-12 h-16 border-2 border-dashed border-slate-600 rounded cursor-pointer flex items-center justify-center text-slate-500">
              {deck.length > 0 ? '🂠' : '↻'}
            </div>
            {waste.length > 0 && renderCard(waste[0], () => handleCardClick(waste[0], 'waste', 0))}
          </div>
          <div className="flex gap-2">
            {foundations.map((foundation, i) => (
              <div
                key={i}
                onClick={() => selected && handleCardClick(null, 'foundation', i)}
                className="w-12 h-16 border-2 border-dashed border-slate-600 rounded flex items-center justify-center"
              >
                {foundation.length > 0 ? renderCard(foundation[foundation.length - 1], () => {}) : SUITS[i]}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-2">
          {tableau.map((pile, i) => (
            <div key={i} className="space-y-1">
              <div
                onClick={() => selected && pile.length === 0 && handleCardClick(null, 'tableau', i)}
                className="w-12 h-16 border-2 border-dashed border-slate-600 rounded"
              />
              {pile.map((card, j) => (
                <div key={j} style={{ marginTop: j > 0 ? '-40px' : '0' }}>
                  {renderCard(card, () => handleCardClick(card, 'tableau', i))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {foundations.every(f => f.length === 13) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xl font-bold text-green-400"
        >
          <Trophy className="w-6 h-6" />
          Gewonnen in {moves} zetten!
        </motion.div>
      )}
    </div>
  );
}
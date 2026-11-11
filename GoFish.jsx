import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function GoFish({ onGameEnd }) {
  const [playerHand, setPlayerHand] = useState([]);
  const [computerHand, setComputerHand] = useState([]);
  const [deck, setDeck] = useState([]);
  const [playerPairs, setPlayerPairs] = useState(0);
  const [computerPairs, setComputerPairs] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cards = [];
    for (let i = 1; i <= 13; i++) {
      for (let j = 0; j < 4; j++) {
        cards.push(i);
      }
    }
    const shuffled = cards.sort(() => Math.random() - 0.5);
    
    setPlayerHand(shuffled.slice(0, 7));
    setComputerHand(shuffled.slice(7, 14));
    setDeck(shuffled.slice(14));
  }, []);

  const askForCard = (card) => {
    const hasCard = computerHand.includes(card);
    
    if (hasCard) {
      const newComputerHand = computerHand.filter(c => c !== card);
      const newPlayerHand = [...playerHand, card];
      
      setComputerHand(newComputerHand);
      setPlayerHand(newPlayerHand);
      setMessage(`Je kreeg een ${card}!`);
      
      checkForPairs(newPlayerHand, true);
    } else {
      setMessage('Vissen!');
      if (deck.length > 0) {
        const newCard = deck[0];
        setPlayerHand([...playerHand, newCard]);
        setDeck(deck.slice(1));
      }
      computerTurn();
    }
  };

  const checkForPairs = (hand, isPlayer) => {
    const counts = {};
    hand.forEach(card => {
      counts[card] = (counts[card] || 0) + 1;
    });

    let pairs = 0;
    const newHand = [];
    
    Object.entries(counts).forEach(([card, count]) => {
      if (count >= 2) {
        pairs += Math.floor(count / 2);
        if (count % 2 === 1) newHand.push(Number(card));
      } else {
        newHand.push(Number(card));
      }
    });

    if (isPlayer) {
      setPlayerHand(newHand);
      setPlayerPairs(playerPairs + pairs);
    } else {
      setComputerHand(newHand);
      setComputerPairs(computerPairs + pairs);
    }

    if (newHand.length === 0 && deck.length === 0) {
      const winner = playerPairs + pairs > computerPairs ? 'player' : 'computer';
      onGameEnd && onGameEnd(winner === 'player' ? 100 : 0);
    }
  };

  const computerTurn = () => {
    setTimeout(() => {
      if (computerHand.length === 0) return;
      
      const card = computerHand[Math.floor(Math.random() * computerHand.length)];
      const hasCard = playerHand.includes(card);
      
      if (hasCard) {
        const newPlayerHand = playerHand.filter(c => c !== card);
        const newComputerHand = [...computerHand, card];
        
        setPlayerHand(newPlayerHand);
        setComputerHand(newComputerHand);
        setMessage(`Computer vroeg om ${card} en kreeg het!`);
        
        checkForPairs(newComputerHand, false);
      } else {
        setMessage(`Computer vist...`);
        if (deck.length > 0) {
          setComputerHand([...computerHand, deck[0]]);
          setDeck(deck.slice(1));
        }
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div>Jouw paren: {playerPairs} | Computer: {computerPairs}</div>
      </div>

      {message && <div className="text-white">{message}</div>}

      <div className="text-white font-semibold">Jouw kaarten:</div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[...new Set(playerHand)].map(card => (
          <Button key={card} onClick={() => askForCard(card)} size="sm" className="bg-blue-600">
            {card}
          </Button>
        ))}
      </div>

      <div className="text-white text-sm">Computer heeft {computerHand.length} kaarten</div>
    </div>
  );
}
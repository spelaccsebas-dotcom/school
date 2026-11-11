import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { DollarSign, RotateCcw } from 'lucide-react';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function Blackjack({ onGameEnd }) {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [deck, setDeck] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealer, ended
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('Plaats je inzet');

  const createDeck = () => {
    const cards = [];
    SUITS.forEach(suit => {
      VALUES.forEach((value, index) => {
        cards.push({
          suit,
          value,
          numValue: index === 0 ? 11 : (index >= 10 ? 10 : index + 1),
          color: suit === '♥' || suit === '♦' ? 'red' : 'black'
        });
      });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const calculateTotal = (hand) => {
    let total = hand.reduce((sum, card) => sum + card.numValue, 0);
    let aces = hand.filter(card => card.value === 'A').length;
    
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const dealInitialCards = (betAmount) => {
    const newDeck = createDeck();
    const player = [newDeck[0], newDeck[2]];
    const dealer = [newDeck[1], newDeck[3]];
    
    setDeck(newDeck.slice(4));
    setPlayerHand(player);
    setDealerHand(dealer);
    setBet(betAmount);
    setGameState('playing');
    setMessage('Hit of Stand?');

    if (calculateTotal(player) === 21) {
      endGame('Blackjack! Je wint!', betAmount * 2.5);
    }
  };

  const hit = () => {
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    const total = calculateTotal(newHand);
    if (total > 21) {
      endGame('Bust! Je verliest', -bet);
    } else if (total === 21) {
      stand();
    }
  };

  const stand = () => {
    setGameState('dealer');
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];
    
    while (calculateTotal(newDealerHand) < 17) {
      newDealerHand.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }
    
    setDealerHand(newDealerHand);
    setDeck(newDeck);

    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(newDealerHand);

    if (dealerTotal > 21) {
      endGame('Dealer bust! Je wint!', bet * 2);
    } else if (playerTotal > dealerTotal) {
      endGame('Je wint!', bet * 2);
    } else if (playerTotal < dealerTotal) {
      endGame('Dealer wint', -bet);
    } else {
      endGame('Gelijkspel', 0);
    }
  };

  const endGame = (msg, winnings) => {
    setMessage(msg);
    setBalance(balance + winnings);
    setGameState('ended');
    
    if (balance + winnings <= 0) {
      setTimeout(() => onGameEnd(0), 2000);
    }
  };

  const newRound = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setMessage('Plaats je inzet');
    setBet(0);
  };

  const renderCard = (card, hidden = false) => (
    <motion.div
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      className={`w-16 h-20 rounded border-2 flex flex-col items-center justify-center text-sm font-bold
        ${hidden 
          ? 'bg-blue-600 border-blue-700' 
          : `bg-white ${card.color === 'red' ? 'text-red-600' : 'text-black'} border-slate-300`
        }
      `}
    >
      {!hidden && (
        <>
          <div>{card.value}</div>
          <div className="text-xl">{card.suit}</div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex items-center justify-between w-full">
        <div className="text-purple-300 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          <span className="font-bold text-white text-xl">{balance}</span>
        </div>
        {bet > 0 && (
          <div className="text-yellow-300">
            Inzet: <span className="font-bold text-white">{bet}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-purple-500/20 w-full">
        {/* Dealer */}
        {dealerHand.length > 0 && (
          <div className="mb-6">
            <div className="text-purple-300 mb-2">
              Dealer {gameState !== 'playing' && `(${calculateTotal(dealerHand)})`}
            </div>
            <div className="flex gap-2">
              {dealerHand.map((card, i) => (
                <div key={i}>{renderCard(card, gameState === 'playing' && i === 1)}</div>
              ))}
            </div>
          </div>
        )}

        {/* Player */}
        {playerHand.length > 0 && (
          <div>
            <div className="text-purple-300 mb-2">
              Jij ({calculateTotal(playerHand)})
            </div>
            <div className="flex gap-2">
              {playerHand.map((card, i) => (
                <div key={i}>{renderCard(card)}</div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="text-center mt-4 text-white font-semibold">
          {message}
        </div>
      </div>

      {/* Controls */}
      {gameState === 'betting' && (
        <div className="flex flex-wrap gap-2">
          {[10, 25, 50, 100].map(amount => (
            <Button
              key={amount}
              onClick={() => dealInitialCards(amount)}
              disabled={balance < amount}
              className="bg-green-600 hover:bg-green-700"
            >
              Inzet ${amount}
            </Button>
          ))}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex gap-4">
          <Button onClick={hit} className="bg-blue-600 hover:bg-blue-700">
            Hit
          </Button>
          <Button onClick={stand} className="bg-red-600 hover:bg-red-700">
            Stand
          </Button>
        </div>
      )}

      {gameState === 'ended' && (
        <Button onClick={newRound} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuwe ronde
        </Button>
      )}
    </div>
  );
}
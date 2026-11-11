import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WORDS = ['COMPUTER', 'KEYBOARD', 'MONITOR', 'TELEFOON', 'TABLET', 'INTERNET', 'SOFTWARE'];

export default function WordScramble({ onGameEnd }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    newWord();
  }, []);

  const newWord = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
    setGuess('');
    setFeedback('');
  };

  const checkGuess = () => {
    if (guess.toUpperCase() === word) {
      setScore(score + 10);
      setFeedback('✅ Correct!');
      setTimeout(() => {
        if (round >= 5) {
          onGameEnd && onGameEnd(score + 10);
        } else {
          setRound(round + 1);
          newWord();
        }
      }, 1000);
    } else {
      setFeedback('❌ Fout!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div>Ronde: {round}/5</div>
      </div>

      <div className="text-white text-3xl font-bold tracking-widest">{scrambled}</div>

      {feedback && <div className="text-white text-xl">{feedback}</div>}

      {round <= 5 && (
        <>
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Raad het woord..."
            className="bg-slate-800 text-white border-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
          />
          <Button onClick={checkGuess} className="bg-purple-600">
            Controleer
          </Button>
        </>
      )}

      {round > 5 && (
        <div className="text-white text-xl">
          Einde! Score: {score}
        </div>
      )}
    </div>
  );
}
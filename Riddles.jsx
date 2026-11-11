import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RIDDLES = [
  { q: 'Ik heb steden, maar geen huizen. Ik heb bossen, maar geen bomen. Wat ben ik?', a: 'KAART' },
  { q: 'Wat wordt natter als het droogt?', a: 'HANDDOEK' },
  { q: 'Wat heeft een nek maar geen hoofd?', a: 'FLES' },
  { q: 'Wat kun je breken zonder het vast te houden?', a: 'BELOFTE' },
  { q: 'Ik heb sleutels maar geen sloten. Wat ben ik?', a: 'PIANO' }
];

export default function Riddles({ onGameEnd }) {
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const checkAnswer = () => {
    if (guess.toUpperCase() === RIDDLES[current].a) {
      setScore(score + 1);
      setFeedback('✅ Correct!');
    } else {
      setFeedback(`❌ Fout! Het was: ${RIDDLES[current].a}`);
    }

    setTimeout(() => {
      if (current + 1 >= RIDDLES.length) {
        onGameEnd && onGameEnd(score * 20);
      } else {
        setCurrent(current + 1);
        setGuess('');
        setFeedback('');
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}/{RIDDLES.length}</div>
        <div>Raadsel {current + 1}/{RIDDLES.length}</div>
      </div>

      <div className="text-white text-lg text-center p-4 bg-slate-800 rounded-lg max-w-md">
        {RIDDLES[current].q}
      </div>

      {feedback && <div className="text-white text-xl">{feedback}</div>}

      {current < RIDDLES.length && !feedback && (
        <>
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Jouw antwoord..."
            className="bg-slate-800 text-white border-purple-500 max-w-xs"
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          />
          <Button onClick={checkAnswer} className="bg-purple-600">
            Controleer
          </Button>
        </>
      )}
    </div>
  );
}
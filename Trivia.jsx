import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  { q: 'Wat is de hoofdstad van Frankrijk?', a: ['Parijs', 'Londen', 'Berlijn'], c: 0 },
  { q: 'Hoeveel planeten heeft ons zonnestelsel?', a: ['7', '8', '9'], c: 1 },
  { q: 'Wat is het grootste zoogdier?', a: ['Olifant', 'Blauwe vinvis', 'Giraffe'], c: 1 },
  { q: 'In welk jaar begon WO2?', a: ['1939', '1940', '1945'], c: 0 },
  { q: 'Wat is H2O?', a: ['Zuurstof', 'Water', 'Waterstof'], c: 1 }
];

export default function Trivia({ onGameEnd }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const answer = (index) => {
    if (answered) return;
    setAnswered(true);
    
    if (index === QUESTIONS[current].c) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (current + 1 >= QUESTIONS.length) {
        onGameEnd && onGameEnd(score + (index === QUESTIONS[current].c ? 1 : 0));
      } else {
        setCurrent(current + 1);
        setAnswered(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}/{QUESTIONS.length}</div>
        <div>Vraag {current + 1}/{QUESTIONS.length}</div>
      </div>

      <div className="text-white text-lg text-center mb-4">
        {QUESTIONS[current].q}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {QUESTIONS[current].a.map((ans, i) => (
          <Button
            key={i}
            onClick={() => answer(i)}
            disabled={answered}
            className={`${
              answered
                ? i === QUESTIONS[current].c
                  ? 'bg-green-600'
                  : 'bg-red-600'
                : 'bg-purple-600'
            }`}
          >
            {ans}
          </Button>
        ))}
      </div>

      {current >= QUESTIONS.length && (
        <div className="text-white text-xl">
          Eindresultaat: {score}/{QUESTIONS.length}
        </div>
      )}
    </div>
  );
}
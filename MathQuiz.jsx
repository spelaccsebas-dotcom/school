import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MathQuiz({ onGameEnd }) {
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+' });
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    newQuestion();
  }, []);

  const newQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    setQuestion({ a, b, op });
    setAnswer('');
    setFeedback('');
  };

  const checkAnswer = () => {
    let correct = 0;
    if (question.op === '+') correct = question.a + question.b;
    if (question.op === '-') correct = question.a - question.b;
    if (question.op === '*') correct = question.a * question.b;

    const newTotal = total + 1;
    setTotal(newTotal);

    if (parseInt(answer) === correct) {
      setScore(score + 1);
      setFeedback('✅ Correct!');
    } else {
      setFeedback(`❌ Fout! Het was ${correct}`);
    }

    if (newTotal >= 10) {
      setTimeout(() => onGameEnd && onGameEnd(score * 10), 1500);
    } else {
      setTimeout(() => newQuestion(), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}/{total}</div>
      </div>

      <div className="text-white text-4xl font-bold">
        {question.a} {question.op} {question.b} = ?
      </div>

      {feedback && <div className="text-white text-xl">{feedback}</div>}

      {total < 10 && !feedback && (
        <>
          <Input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Antwoord..."
            className="bg-slate-800 text-white border-purple-500 max-w-xs text-center text-2xl"
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
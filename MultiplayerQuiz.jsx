import React, { useState, useEffect } from 'react';

const QUESTIONS = [
  { q: 'Wat is de hoofdstad van Nederland?', a: 'Amsterdam', options: ['Rotterdam', 'Amsterdam', 'Den Haag', 'Utrecht'] },
  { q: 'Hoeveel planeten zijn er in ons zonnestelsel?', a: '8', options: ['7', '8', '9', '10'] },
  { q: 'Wat is 12 x 12?', a: '144', options: ['122', '132', '144', '156'] },
  { q: 'Welk dier is de grootste op land?', a: 'Olifant', options: ['Nijlpaard', 'Giraf', 'Olifant', 'Neushoorn'] },
  { q: 'In welk jaar begon WO2?', a: '1939', options: ['1935', '1937', '1939', '1941'] },
  { q: 'Wat is de snelste vogel?', a: 'Slechtvalk', options: ['Arend', 'Struisvogel', 'Slechtvalk', 'Albatros'] },
  { q: 'Hoeveel kleuren heeft een regenboog?', a: '7', options: ['5', '6', '7', '8'] },
  { q: 'Wat is de grootste oceaan?', a: 'Stille Oceaan', options: ['Atlantische Oceaan', 'Indische Oceaan', 'Stille Oceaan', 'Arctische Oceaan'] },
  { q: 'Wie schilderde de Mona Lisa?', a: 'Leonardo da Vinci', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'] },
  { q: 'Wat is het chemische symbool voor goud?', a: 'Au', options: ['Go', 'Gd', 'Au', 'Ag'] },
];

export default function MultiplayerQuiz({ onGameEnd }) {
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(null); // { player, answer }
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || gameOver || answered) return;
    if (timeLeft <= 0) {
      showFeedback(null, null);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, gameOver, answered]);

  const showFeedback = (player, answer) => {
    const correct = QUESTIONS[qIndex].a;
    const isCorrect = answer === correct;
    setFeedback({ player, answer, correct, isCorrect });
    if (isCorrect && player !== null) {
      setScores(s => { const n = [...s]; n[player] += Math.max(10, timeLeft * 10); return n; });
    }
    setTimeout(() => {
      setFeedback(null);
      setAnswered(null);
      if (qIndex + 1 >= QUESTIONS.length) {
        setGameOver(true);
        onGameEnd?.(Math.max(scores[0], scores[1]));
      } else {
        setQIndex(i => i + 1);
        setTimeLeft(10);
      }
    }, 1500);
  };

  const handleAnswer = (player, answer) => {
    if (answered || feedback) return;
    setAnswered({ player, answer });
    showFeedback(player, answer);
  };

  const reset = () => {
    setQIndex(0); setScores([0, 0]); setTimeLeft(10);
    setAnswered(null); setFeedback(null); setGameOver(false); setStarted(false);
  };

  if (!started) return (
    <div className="text-center py-4">
      <h3 className="text-white font-bold text-lg mb-2">Multiplayer Quiz</h3>
      <p className="text-slate-400 text-sm mb-4">2 spelers, één scherm. Eerste die klikt scoort punten!</p>
      <div className="flex gap-4 justify-center text-sm mb-6">
        <div className="text-green-400">🟢 Speler 1: Knoppen links</div>
        <div className="text-blue-400">🔵 Speler 2: Knoppen rechts</div>
      </div>
      <button onClick={() => setStarted(true)} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">
        Start Quiz
      </button>
    </div>
  );

  if (gameOver) {
    const winner = scores[0] > scores[1] ? 'Speler 1' : scores[1] > scores[0] ? 'Speler 2' : 'Gelijkspel';
    return (
      <div className="text-center py-4">
        <div className="text-yellow-400 font-bold text-xl mb-2">{winner === 'Gelijkspel' ? '🤝 Gelijkspel!' : `${winner} wint! 🏆`}</div>
        <div className="flex gap-8 justify-center mb-4">
          <div className="text-green-400">Speler 1: {scores[0]}</div>
          <div className="text-blue-400">Speler 2: {scores[1]}</div>
        </div>
        <button onClick={reset} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Opnieuw</button>
      </div>
    );
  }

  const q = QUESTIONS[qIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between text-sm">
        <span className="text-green-400 font-bold">🟢 Speler 1: {scores[0]}</span>
        <span className="text-white font-bold">Vraag {qIndex + 1}/{QUESTIONS.length}</span>
        <span className="text-blue-400 font-bold">Speler 2: {scores[1]} 🔵</span>
      </div>

      <div className={`text-center text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto ${timeLeft <= 3 ? 'bg-red-500/30 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
        {timeLeft}
      </div>

      <div className="bg-slate-800/60 rounded-xl p-4 text-center">
        <p className="text-white font-semibold text-base">{q.q}</p>
      </div>

      {feedback && (
        <div className={`text-center p-2 rounded-lg ${feedback.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {feedback.isCorrect ? `✅ Speler ${feedback.player + 1} scoort!` : `❌ Fout! Het was: ${feedback.correct}`}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAnswer(0, opt)}
              disabled={!!feedback}
              className="py-2 px-3 bg-green-700/40 hover:bg-green-600/60 border border-green-600/40 text-white rounded-lg text-sm transition-all disabled:opacity-50"
            >
              🟢 {opt}
            </button>
            <button
              onClick={() => handleAnswer(1, opt)}
              disabled={!!feedback}
              className="py-2 px-3 bg-blue-700/40 hover:bg-blue-600/60 border border-blue-600/40 text-white rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {opt} 🔵
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Check, ArrowRight } from 'lucide-react';

const QUESTIONS = [
  {
    question: "Wat is de hoofdstad van Nederland?",
    options: ["Rotterdam", "Amsterdam", "Den Haag", "Utrecht"],
    correct: 1
  },
  {
    question: "Hoeveel kleuren heeft een regenboog?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "Wat is het grootste dier op aarde?",
    options: ["Olifant", "Blauwe vinvis", "Giraffe", "Nijlpaard"],
    correct: 1
  },
  {
    question: "Hoeveel dagen heeft februari in een schrikkeljaar?",
    options: ["28", "29", "30", "31"],
    correct: 1
  },
  {
    question: "Welke planeet is het dichtst bij de zon?",
    options: ["Venus", "Mars", "Mercurius", "Aarde"],
    correct: 2
  },
  {
    question: "Wat is de chemische formule van water?",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correct: 1
  },
  {
    question: "In welk jaar begon de Tweede Wereldoorlog?",
    options: ["1935", "1939", "1941", "1945"],
    correct: 1
  },
  {
    question: "Hoeveel continenten zijn er op aarde?",
    options: ["5", "6", "7", "8"],
    correct: 2
  }
];

export default function QuizGame({ onGameEnd }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Shuffle and pick 5 questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
  }, []);

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setGameOver(true);
      onGameEnd(score * 200);
    } else {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
  };

  if (questions.length === 0) return null;

  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <Trophy className="w-16 h-16 text-yellow-400" />
        <div>
          <div className="text-3xl font-bold text-white mb-2">Quiz Voltooid!</div>
          <div className="text-xl text-purple-300">
            Je score: <span className="font-bold text-white">{score}/{questions.length}</span>
          </div>
        </div>
        <Button onClick={restartGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
          Opnieuw spelen
        </Button>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="flex items-center justify-between w-full">
        <div className="text-purple-300">
          Vraag <span className="font-bold text-white">{currentQuestion + 1}/{questions.length}</span>
        </div>
        <div className="text-purple-300">
          Score: <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full"
        >
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/20 mb-6">
            <h2 className="text-xl font-semibold text-white">{question.question}</h2>
          </div>

          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correct;
              const isSelected = index === selectedAnswer;
              
              let buttonClass = 'bg-slate-800/50 border-purple-500/30 hover:border-purple-500/50 hover:bg-slate-700/50';
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass = 'bg-green-500/20 border-green-500 text-green-300';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-500/20 border-red-500 text-red-300';
                } else {
                  buttonClass = 'bg-slate-800/30 border-slate-700 opacity-50';
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${buttonClass}`}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <span className="text-white">{option}</span>
                  {showResult && isCorrect && <Check className="w-5 h-5 text-green-400" />}
                  {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={nextQuestion} className="bg-gradient-to-r from-purple-500 to-pink-500">
            {currentQuestion + 1 >= questions.length ? 'Bekijk resultaat' : 'Volgende vraag'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
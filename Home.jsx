import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useSiteTexts } from '@/lib/siteTexts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Trophy, Sparkles, Users } from 'lucide-react';
import GameCard from '../components/GameCard';
import GameReviews from '../components/GameReviews';
import MultiplayerLobby from '../components/MultiplayerLobby';
import TicTacToeMultiplayer from '../components/games/TicTacToeMultiplayer';

import MemoryGame from '../components/games/MemoryGame';
import SnakeGame from '../components/games/SnakeGame';
import TicTacToe from '../components/games/TicTacToe';
import ReactionGame from '../components/games/ReactionGame';
import WhackAMole from '../components/games/WhackAMole';
import SimonSays from '../components/games/SimonSays';
import NumberGuess from '../components/games/NumberGuess';
import QuizGame from '../components/games/QuizGame';
import ColorMatch from '../components/games/ColorMatch';
import MathRace from '../components/games/MathRace';
import TypingGame from '../components/games/TypingGame';
import BrickBreaker from '../components/games/BrickBreaker';
import FlappyBird from '../components/games/FlappyBird';
import PuzzleSlide from '../components/games/PuzzleSlide';
import RaceGame from '../components/games/RaceGame';
import Game2048 from '../components/games/Game2048';
import Minesweeper from '../components/games/Minesweeper';
import SpaceShooter from '../components/games/SpaceShooter';
import Pong from '../components/games/Pong';
import JumpGame from '../components/games/JumpGame';
import Tetris from '../components/games/Tetris';
import BubbleShooter from '../components/games/BubbleShooter';
import Hangman from '../components/games/Hangman';
import ConnectFour from '../components/games/ConnectFour';
import WordSearch from '../components/games/WordSearch';
import Sudoku from '../components/games/Sudoku';
import PacMan from '../components/games/PacMan';
import TowerDefense from '../components/games/TowerDefense';
import Solitaire from '../components/games/Solitaire';
import Blackjack from '../components/games/Blackjack';
import CookieClicker from '../components/games/CookieClicker';
import Checkers from '../components/games/Checkers';
import Reversi from '../components/games/Reversi';
import Pinball from '../components/games/Pinball';
import DiceGame from '../components/games/DiceGame';
import Battleship from '../components/games/Battleship';
import Yahtzee from '../components/games/Yahtzee';
import Maze from '../components/games/Maze';

import Asteroids from '../components/games/Asteroids';
import Frogger from '../components/games/Frogger';
import TowerStack from '../components/games/TowerStack';
import Match3 from '../components/games/Match3';
import WordScramble from '../components/games/WordScramble';
import SpotDifference from '../components/games/SpotDifference';
import RockPaperScissors from '../components/games/RockPaperScissors';
import SlotMachine from '../components/games/SlotMachine';
import DotBox from '../components/games/DotBox';
import NimGame from '../components/games/NimGame';
import CardFlip from '../components/games/CardFlip';
import Trivia from '../components/games/Trivia';
import Riddles from '../components/games/Riddles';
import Concentration from '../components/games/Concentration';
import Jigsaw from '../components/games/Jigsaw';
import TicTacToe5x5 from '../components/games/TicTacToe5x5';
import GoFish from '../components/games/GoFish';
import MathQuiz from '../components/games/MathQuiz';
import CoinFlip from '../components/games/CoinFlip';
import FastClick from '../components/games/FastClick';
import PatternMatch from '../components/games/PatternMatch';
import FindPair from '../components/games/FindPair';
import TargetShoot from '../components/games/TargetShoot';
import BalloonPop from '../components/games/BalloonPop';
import BuilderGame from '../components/games/BuilderGame';
import Chess from '../components/games/Chess';
import MultiplayerSnake from '../components/games/MultiplayerSnake';
import MultiplayerQuiz from '../components/games/MultiplayerQuiz';
import Racing3D from '../components/games/Racing3D';
import DungeonCrawler from '../components/games/DungeonCrawler';

const GAMES = [
  {
    id: 'memory',
    name: 'Memory',
    description: 'Vind alle paren door kaarten om te draaien',
    icon: '🧠',
    bgColor: 'bg-purple-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: MemoryGame,
    multiplayer: false
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Klassieke snake game - eet en groei!',
    icon: '🐍',
    bgColor: 'bg-green-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: SnakeGame
  },
  {
    id: 'tictactoe',
    name: 'Boter Kaas Eieren',
    description: 'Speel tegen de AI of andere spelers',
    icon: '⭕',
    bgColor: 'bg-blue-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: TicTacToe,
    multiplayer: true,
    multiplayerComponent: TicTacToeMultiplayer
  },
  {
    id: 'reaction',
    name: 'Reactie Test',
    description: 'Test hoe snel je kunt reageren',
    icon: '⚡',
    bgColor: 'bg-yellow-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: ReactionGame
  },
  {
    id: 'whackamole',
    name: 'Whack-a-Mole',
    description: 'Sla de mollen zo snel mogelijk!',
    icon: '🐹',
    bgColor: 'bg-amber-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: WhackAMole
  },
  {
    id: 'simonsays',
    name: 'Simon Says',
    description: 'Onthoud en herhaal de kleurenreeks',
    icon: '🎨',
    bgColor: 'bg-pink-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: SimonSays
  },
  {
    id: 'numberguess',
    name: 'Raad het Getal',
    description: 'Raad het geheime getal tussen 1-100',
    icon: '🔢',
    bgColor: 'bg-indigo-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: NumberGuess
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Test je algemene kennis',
    icon: '❓',
    bgColor: 'bg-cyan-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: QuizGame
  },
  {
    id: 'colormatch',
    name: 'Kleur Match',
    description: 'Komt de kleur overeen met het woord?',
    icon: '🌈',
    bgColor: 'bg-rose-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: ColorMatch
  },
  {
    id: 'mathrace',
    name: 'Reken Race',
    description: 'Los sommen op tegen de klok',
    icon: '➕',
    bgColor: 'bg-emerald-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: MathRace
  },
  {
    id: 'typing',
    name: 'Type Race',
    description: 'Typ woorden zo snel mogelijk',
    icon: '⌨️',
    bgColor: 'bg-violet-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: TypingGame
  },
  {
    id: 'brickbreaker',
    name: 'Brick Breaker',
    description: 'Breek alle blokken met de bal',
    icon: '🧱',
    bgColor: 'bg-orange-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: BrickBreaker
  },
  {
    id: 'flappybird',
    name: 'Flappy Bird',
    description: 'Vlieg door de obstakels',
    icon: '🐦',
    bgColor: 'bg-sky-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: FlappyBird
  },
  {
    id: 'puzzle',
    name: 'Schuifpuzzel',
    description: 'Schuif de tegels in de juiste volgorde',
    icon: '🧩',
    bgColor: 'bg-fuchsia-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: PuzzleSlide
  },
  {
    id: 'race',
    name: 'Auto Race',
    description: 'Race over de snelweg en ontijk auto\'s',
    icon: '🏎️',
    bgColor: 'bg-red-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: RaceGame
  },
  {
    id: '2048',
    name: '2048',
    description: 'Combineer tegels om 2048 te bereiken',
    icon: '🔢',
    bgColor: 'bg-orange-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Game2048
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Vind alle mijnen zonder ze te raken',
    icon: '💣',
    bgColor: 'bg-slate-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Minesweeper
  },
  {
    id: 'spaceshooter',
    name: 'Space Shooter',
    description: 'Schiet aliens neer in de ruimte',
    icon: '🚀',
    bgColor: 'bg-indigo-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: SpaceShooter
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'Klassieke paddle game tegen AI',
    icon: '🏓',
    bgColor: 'bg-teal-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: Pong
  },
  {
    id: 'jump',
    name: 'Jump Game',
    description: 'Spring van platform naar platform',
    icon: '⬆️',
    bgColor: 'bg-cyan-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: JumpGame
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Stapel vallende blokken perfect',
    icon: '🟦',
    bgColor: 'bg-blue-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Tetris
  },
  {
    id: 'bubbleshooter',
    name: 'Bubble Shooter',
    description: 'Match 3 of meer bubbles',
    icon: '🫧',
    bgColor: 'bg-sky-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: BubbleShooter
  },
  {
    id: 'hangman',
    name: 'Galgje',
    description: 'Raad het woord letter voor letter',
    icon: '📝',
    bgColor: 'bg-lime-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Hangman
  },
  {
    id: 'connectfour',
    name: 'Vier op een Rij',
    description: 'Versla de AI in dit strategie spel',
    icon: '🔴',
    bgColor: 'bg-red-600/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: ConnectFour
  },
  {
    id: 'wordsearch',
    name: 'Woordzoeker',
    description: 'Vind alle verborgen woorden',
    icon: '🔍',
    bgColor: 'bg-emerald-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: WordSearch
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Los de nummer puzzel op',
    icon: '🔢',
    bgColor: 'bg-violet-500/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Sudoku
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    description: 'Eet alle dots en ontwijkt ghosts',
    icon: '👻',
    bgColor: 'bg-yellow-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: PacMan
  },
  {
    id: 'towerdefense',
    name: 'Tower Defense',
    description: 'Verdedig je basis tegen golven vijanden',
    icon: '🗼',
    bgColor: 'bg-green-600/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: TowerDefense
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    description: 'Klassiek kaartspel',
    icon: '🃏',
    bgColor: 'bg-rose-500/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Solitaire
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Versla de dealer met 21',
    icon: '🎰',
    bgColor: 'bg-amber-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: Blackjack
  },
  {
    id: 'cookieclicker',
    name: 'Cookie Clicker',
    description: 'Klik koekjes en koop upgrades',
    icon: '🍪',
    bgColor: 'bg-orange-500/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: CookieClicker
  },
  {
    id: 'checkers',
    name: 'Dammen',
    description: 'Klassiek damspel tegen jezelf',
    icon: '⚫',
    bgColor: 'bg-amber-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Checkers
  },
  {
    id: 'reversi',
    name: 'Reversi',
    description: 'Flip de stenen en verover het bord',
    icon: '⚪',
    bgColor: 'bg-green-600/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Reversi
  },
  {
    id: 'pinball',
    name: 'Pinball',
    description: 'Klassieke flipperkast',
    icon: '🎯',
    bgColor: 'bg-blue-600/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Pinball
  },
  {
    id: 'dice',
    name: 'Dobbelspel',
    description: 'Gooi de dobbelstenen en versla de computer',
    icon: '🎲',
    bgColor: 'bg-red-600/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: DiceGame
  },
  {
    id: 'battleship',
    name: 'Zeeslag',
    description: 'Versla de computer schepen',
    icon: '⚓',
    bgColor: 'bg-blue-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Battleship
  },
  {
    id: 'yahtzee',
    name: 'Yahtzee',
    description: 'Gooi dobbelstenen voor combos',
    icon: '🎲',
    bgColor: 'bg-purple-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Yahtzee
  },
  {
    id: 'maze',
    name: 'Doolhof',
    description: 'Vind de uitgang van het doolhof',
    icon: '🌀',
    bgColor: 'bg-gray-700/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: Maze
  },

  {
    id: 'asteroids',
    name: 'Asteroids',
    description: 'Schiet asteroïden in de ruimte',
    icon: '☄️',
    bgColor: 'bg-slate-900/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Asteroids
  },
  {
    id: 'frogger',
    name: 'Frogger',
    description: 'Help de kikker oversteken',
    icon: '🐸',
    bgColor: 'bg-green-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Frogger
  },
  {
    id: 'towerstack',
    name: 'Toren Stapelen',
    description: 'Stapel blokken zo hoog mogelijk',
    icon: '🏗️',
    bgColor: 'bg-orange-700/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: TowerStack
  },
  {
    id: 'match3',
    name: 'Match 3',
    description: 'Match 3 of meer symbolen',
    icon: '💎',
    bgColor: 'bg-pink-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Match3
  },
  {
    id: 'wordscramble',
    name: 'Woord Puzzel',
    description: 'Ontwar de letters tot een woord',
    icon: '🔤',
    bgColor: 'bg-teal-700/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: WordScramble
  },
  {
    id: 'spotdifference',
    name: 'Zoek Verschillen',
    description: 'Vind alle verschillen',
    icon: '🔍',
    bgColor: 'bg-cyan-700/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: SpotDifference
  },
  {
    id: 'rps',
    name: 'Steen Papier Schaar',
    description: 'Klassieke Steen Papier Schaar',
    icon: '✊',
    bgColor: 'bg-red-700/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: RockPaperScissors
  },
  {
    id: 'slotmachine',
    name: 'Gokautomaat',
    description: 'Probeer je geluk met slots',
    icon: '🎰',
    bgColor: 'bg-yellow-700/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: SlotMachine
  },
  {
    id: 'dotbox',
    name: 'Dots & Boxes',
    description: 'Maak vakjes door lijnen te trekken',
    icon: '⬜',
    bgColor: 'bg-purple-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: DotBox
  },
  {
    id: 'nimgame',
    name: 'Nim Spel',
    description: 'Strategisch stokjes spel',
    icon: '🎯',
    bgColor: 'bg-amber-800/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: NimGame
  },
  {
    id: 'cardflip',
    name: 'Kaart Memory',
    description: 'Vind matching kaarten',
    icon: '🃏',
    bgColor: 'bg-red-800/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: CardFlip
  },
  {
    id: 'trivia',
    name: 'Trivia Quiz',
    description: 'Test je algemene kennis',
    icon: '🧠',
    bgColor: 'bg-blue-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Trivia
  },
  {
    id: 'riddles',
    name: 'Raadsels',
    description: 'Los raadsels op',
    icon: '🤔',
    bgColor: 'bg-indigo-800/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Riddles
  },
  {
    id: 'concentration',
    name: 'Concentratie',
    description: 'Onthoud de volgorde',
    icon: '🎯',
    bgColor: 'bg-green-800/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Concentration
  },
  {
    id: 'jigsaw',
    name: 'Jigsaw Puzzel',
    description: 'Sleep de stukken op de juiste plek',
    icon: '🧩',
    bgColor: 'bg-pink-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Jigsaw
  },
  {
    id: 'ttt5x5',
    name: 'Boter Kaas Eieren 5x5',
    description: '5 op een rij versie',
    icon: '⭕',
    bgColor: 'bg-cyan-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: TicTacToe5x5
  },
  {
    id: 'gofish',
    name: 'Go Fish',
    description: 'Kaartspel verzamel paren',
    icon: '🐠',
    bgColor: 'bg-teal-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: GoFish
  },
  {
    id: 'mathquiz',
    name: 'Reken Quiz',
    description: 'Los sommen snel op',
    icon: '➗',
    bgColor: 'bg-orange-800/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: MathQuiz
  },
  {
    id: 'coinflip',
    name: 'Muntje Gooien',
    description: 'Voorspel kop of munt',
    icon: '🪙',
    bgColor: 'bg-yellow-800/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: CoinFlip
  },
  {
    id: 'fastclick',
    name: 'Snel Klikken',
    description: 'Klik zo snel mogelijk',
    icon: '👆',
    bgColor: 'bg-red-800/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: FastClick
  },
  {
    id: 'patternmatch',
    name: 'Patroon Match',
    description: 'Onthoud en herhaal patronen',
    icon: '🎨',
    bgColor: 'bg-violet-800/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: PatternMatch
  },
  {
    id: 'findpair',
    name: 'Vind Paren',
    description: 'Match emoji paren',
    icon: '👯',
    bgColor: 'bg-fuchsia-800/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    component: FindPair
  },
  {
    id: 'targetshoot',
    name: 'Doelwitten Schieten',
    description: 'Schiet alle doelwitten',
    icon: '🎯',
    bgColor: 'bg-lime-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: TargetShoot
  },
  {
    id: 'balloonpop',
    name: 'Ballon Knallen',
    description: 'Knal ballonnen maar pas op voor bommen',
    icon: '🎈',
    bgColor: 'bg-sky-800/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: BalloonPop
  },
  {
    id: 'chess',
    name: 'Schaken',
    description: 'Klassiek schaakspel voor twee spelers',
    icon: '♟️',
    bgColor: 'bg-amber-900/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: Chess
  },
  {
    id: 'multisnake',
    name: 'Snake 2 Spelers',
    description: 'Speel Snake samen op één scherm!',
    icon: '🐍',
    bgColor: 'bg-green-900/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: MultiplayerSnake
  },
  {
    id: 'multiquiz',
    name: 'Quiz Battle',
    description: 'Wie antwoordt het snelst? 2 spelers!',
    icon: '⚔️',
    bgColor: 'bg-purple-900/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: MultiplayerQuiz
  },
  {
    id: 'racing3d',
    name: '3D Racing',
    description: 'Race in 3D en ontwijkt auto\'s',
    icon: '🏎️',
    bgColor: 'bg-red-900/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: Racing3D
  },
  {
    id: 'dungeon',
    name: '3D Dungeon',
    description: 'Verken een 3D doolhof in first-person',
    icon: '🏰',
    bgColor: 'bg-indigo-900/20',
    difficulty: 'Moeilijk',
    difficultyColor: 'bg-red-500/20 text-red-400',
    component: DungeonCrawler
  },
  {
    id: 'builder',
    name: '3D Stad Bouwen',
    description: 'Bouw je eigen stad in 3D first-person',
    icon: '🏙️',
    bgColor: 'bg-blue-900/20',
    difficulty: 'Gemiddeld',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    component: BuilderGame
  },
  {
    id: 'linkgame',
    name: 'Aap Link',
    description: 'Klik en ontdek waar je terechtkomt!',
    icon: '🐵',
    bgColor: 'bg-amber-600/20',
    difficulty: 'Makkelijk',
    difficultyColor: 'bg-green-500/20 text-green-400',
    isLink: true
  }
];

function shuffleWithSeed(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [hiddenGames, setHiddenGames] = useState([]);
  const [gameDoorElkaar, setGameDoorElkaar] = useState(null);
  const [blindness, setBlindness] = useState(false);
  const [linkGameUrl, setLinkGameUrl] = useState('');
  const [linkGameName, setLinkGameName] = useState('Aap Link');
  const { t } = useSiteTexts();

  useEffect(() => {
    base44.entities.HiddenGame.list().then(setHiddenGames);
    const unsub = base44.entities.HiddenGame.subscribe((event) => {
      if (event.type === 'create') setHiddenGames(prev => [...prev, event.data]);
      else if (event.type === 'delete') setHiddenGames(prev => prev.filter(h => h.id !== event.id));
    });
    return unsub;
  }, []);

  // Load GameDoorElkaar event
  useEffect(() => {
    const load = async () => {
      const settings = await base44.entities.SiteSettings.list();
      const s = settings.find(s => s.key === 'gamedoorelkaar');
      if (s) {
        try { setGameDoorElkaar(JSON.parse(s.value)); } catch {}
      }
      const linkSetting = settings.find(s => s.key === 'linkgame_url');
      if (linkSetting) setLinkGameUrl(linkSetting.value);
      setLinkGameName(settings.find(s => s.key === 'linkgame_name')?.value || 'Aap Link');
    };
    load();
    const unsub = base44.entities.SiteSettings.subscribe((event) => {
      if (event.data?.key === 'gamedoorelkaar') {
        try { setGameDoorElkaar(JSON.parse(event.data.value)); } catch {}
      }
      if (event.data?.key === 'blindness') {
        try {
          const d = JSON.parse(event.data.value);
          setBlindness(d?.active && (!d?.expires || new Date(d.expires) > new Date()));
        } catch {}
      }
      if (event.data?.key === 'linkgame_url') {
        setLinkGameUrl(event.data.value);
      }
      if (event.data?.key === 'linkgame_name') {
        setLinkGameName(event.data.value || 'Aap Link');
      }
    });
    return unsub;
  }, []);

  // Load blindness on mount
  useEffect(() => {
    base44.entities.SiteSettings.list().then(settings => {
      const s = settings.find(s => s.key === 'blindness');
      if (s) {
        try {
          const d = JSON.parse(s.value);
          setBlindness(d?.active && (!d?.expires || new Date(d.expires) > new Date()));
        } catch {}
      }
    });
  }, []);

  const hiddenIds = hiddenGames.map(h => h.game_id);
  let visibleGames = GAMES.filter(g => !hiddenIds.includes(g.id)).map(g => g.isLink ? { ...g, name: linkGameName } : g);

  // Shuffle if GameDoorElkaar is active
  const gdeActive = gameDoorElkaar?.active && (!gameDoorElkaar?.expires || new Date(gameDoorElkaar.expires) > new Date());
  if (gdeActive && gameDoorElkaar?.seed) {
    visibleGames = shuffleWithSeed(visibleGames, gameDoorElkaar.seed);
  }

  const [selectedGame, setSelectedGame] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        // Auto-reset expired multiplier
        if (currentUser.multiplier_expires && new Date(currentUser.multiplier_expires) < new Date()) {
          await base44.auth.updateMe({
            score_multiplier: currentUser.multiplier_original || 1,
            multiplier_expires: '',
            multiplier_original: 1,
          });
          const updated = await base44.auth.me();
          setUser(updated);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const saveScoreMutation = useMutation({
    mutationFn: (data) => base44.entities.Score.create(data),
    onSuccess: () => {
      window.__gameOpen = false;
      queryClient.invalidateQueries({ queryKey: ['scores'] });
      setShowScoreModal(false);
      setSelectedGame(null);
      setPlayerName('');
      if (window.__pendingReload) {
        window.__pendingReload = false;
        setTimeout(() => window.location.reload(), 300);
      }
    }
  });

  const handleGameEnd = useCallback((score) => {
    window.__gameOpen = true;
    setLastScore(score);
    setShowScoreModal(true);
  }, []);

  const handleGameStart = useCallback((game, mode = 'single') => {
    if (game.isLink) {
      const target = linkGameUrl || 'https://media.base44.com/images/public/694d89b8891a8aacaa3966ac/f017a7075_generated_image.png';
      window.open(/^https?:\/\//i.test(target) ? target : `https://${target}`, '_blank', 'noopener,noreferrer');
      return;
    }
    window.__gameOpen = true;
    setSelectedGame(game);
    setGameMode(mode);
    
    if (mode === 'multiplayer' && game.multiplayer) {
      setShowMultiplayerLobby(true);
    }
    
    if (user) {
      base44.entities.Activity.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        activity_type: 'game_start',
        details: { game: game.name, mode }
      }).catch(() => {});
    }
  }, [user, linkGameUrl]);

  const handleMultiplayerStart = useCallback((room, role) => {
    setMultiplayerRoom(room);
    setPlayerRole(role);
    setShowMultiplayerLobby(false);
  }, []);

  const handleCloseGame = useCallback(() => {
    window.__gameOpen = false;
    setSelectedGame(null);
    setShowMultiplayerLobby(false);
    setGameMode(null);
    setMultiplayerRoom(null);
    setPlayerRole(null);
    // If a reload was triggered while in a game, do it now
    if (window.__pendingReload) {
      window.__pendingReload = false;
      setTimeout(() => window.location.reload(), 300);
    }
  }, []);

  const saveScore = () => {
    const multiplier = (user?.score_multiplier || 1) * (blindness ? 10 : 1);
    const finalScore = lastScore * multiplier;
    saveScoreMutation.mutate({
      game: selectedGame.name,
      score: finalScore,
      player_name: user?.full_name || 'Speler'
    });
    
    if (user) {
      base44.entities.Activity.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        activity_type: 'game_end',
        details: { game: selectedGame.name, score: lastScore }
      }).catch(() => {});
    }
  };

  const GameComponent = selectedGame?.component;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">{t('home.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 glow-text">
            {t('home.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {visibleGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GameCard 
                game={game} 
                onClick={() => handleGameStart(game, 'single')}
                onMultiplayerClick={game.multiplayer ? () => handleGameStart(game, 'multiplayer') : null}
                blind={blindness}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Game Modal */}
      <Dialog open={!!selectedGame && !showScoreModal && !showMultiplayerLobby} onOpenChange={handleCloseGame}>
        <DialogContent className="max-w-lg bg-slate-900 border-purple-500/20 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{selectedGame?.icon}</span>
                {selectedGame?.name}
                {gameMode === 'multiplayer' && (
                  <span className="text-sm px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                    Multiplayer
                  </span>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseGame}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {gameMode === 'multiplayer' && multiplayerRoom && selectedGame?.multiplayerComponent ? (
              React.createElement(selectedGame.multiplayerComponent, {
                room: multiplayerRoom,
                playerRole: playerRole,
                onGameEnd: handleGameEnd
              })
            ) : (
              GameComponent && <GameComponent onGameEnd={handleGameEnd} />
            )}
            {selectedGame && <GameReviews game={selectedGame} user={user} />}
          </div>
          {/* Floating Save Score Button - only for single player */}
          {gameMode !== 'multiplayer' && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => handleGameEnd(lastScore)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-lg"
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Score Opslaan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Multiplayer Lobby Modal */}
      <Dialog open={showMultiplayerLobby} onOpenChange={() => setShowMultiplayerLobby(false)}>
        <DialogContent className="max-w-lg bg-slate-900 border-purple-500/20">
          <MultiplayerLobby 
            game={selectedGame}
            onStartGame={handleMultiplayerStart}
            onClose={() => setShowMultiplayerLobby(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Score Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-sm bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-center flex flex-col items-center gap-4">
              <Trophy className="w-16 h-16 text-yellow-400" />
              Score: {lastScore * (user?.score_multiplier || 1) * (blindness ? 10 : 1)}
              {((user?.score_multiplier || 1) > 1 || blindness) && (
                <span className="text-sm text-yellow-400 font-normal">{lastScore} × {(user?.score_multiplier || 1) * (blindness ? 10 : 1)}X = {lastScore * (user?.score_multiplier || 1) * (blindness ? 10 : 1)} 🚀</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-center">
              <div className="text-slate-400 text-sm mb-1">Speler</div>
              <div className="text-white font-semibold">{user?.full_name || user?.email}</div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-purple-500/30"
                onClick={() => {
                  setShowScoreModal(false);
                  setSelectedGame(null);
                }}
              >
                Sluiten
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                onClick={saveScore}
                disabled={saveScoreMutation.isPending}
              >
                {saveScoreMutation.isPending ? 'Opslaan...' : 'Score Opslaan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
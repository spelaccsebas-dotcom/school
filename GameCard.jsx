import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function GameCard({ game, onClick, onMultiplayerClick, blind = false }) {
  return (
    <motion.div
      className="game-card bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden transition-all duration-300 w-full"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onClick}
        className="p-6 text-left w-full group"
      >
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${blind ? 'bg-white/10' : game.bgColor}`}>
            {blind ? <span className="text-2xl opacity-0">{game.icon}</span> : game.icon}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-lg font-semibold text-white mt-4 mb-2">{blind ? '???' : game.name}</h3>
        <p className="text-slate-400 text-sm line-clamp-2">{blind ? '??? ??? ???' : game.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${game.difficultyColor}`}>
            {game.difficulty}
          </span>
          {game.multiplayer && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Multiplayer
            </span>
          )}
        </div>
      </button>
      
      {game.multiplayer && onMultiplayerClick && (
        <div className="border-t border-purple-500/10 p-3">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMultiplayerClick();
            }}
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Speel Multiplayer
          </Button>
        </div>
      )}
    </motion.div>
  );
}
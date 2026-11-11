import React, { useState } from 'react';

const PIECES = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const initBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = ['R','N','B','Q','K','B','N','R'];
  for (let i = 0; i < 8; i++) {
    board[0][i] = 'b' + backRow[i];
    board[1][i] = 'bP';
    board[6][i] = 'wP';
    board[7][i] = 'w' + backRow[i];
  }
  return board;
};

const getColor = (piece) => piece ? piece[0] : null;

const isValidMove = (board, from, to, currentTurn) => {
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = board[fr][fc];
  if (!piece || getColor(piece) !== currentTurn) return false;
  const target = board[tr][tc];
  if (target && getColor(target) === currentTurn) return false;
  const type = piece[1];
  const dr = tr - fr, dc = tc - fc;

  if (type === 'P') {
    const dir = currentTurn === 'w' ? -1 : 1;
    const startRow = currentTurn === 'w' ? 6 : 1;
    if (dc === 0 && dr === dir && !target) return true;
    if (dc === 0 && dr === 2 * dir && fr === startRow && !target && !board[fr + dir][fc]) return true;
    if (Math.abs(dc) === 1 && dr === dir && target) return true;
    return false;
  }
  if (type === 'N') return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  if (type === 'K') return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  if (type === 'R') {
    if (dr !== 0 && dc !== 0) return false;
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    for (let i = 1; i < Math.max(Math.abs(dr), Math.abs(dc)); i++) {
      if (board[fr + i * stepR][fc + i * stepC]) return false;
    }
    return true;
  }
  if (type === 'B') {
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    const stepR = dr / Math.abs(dr), stepC = dc / Math.abs(dc);
    for (let i = 1; i < Math.abs(dr); i++) {
      if (board[fr + i * stepR][fc + i * stepC]) return false;
    }
    return true;
  }
  if (type === 'Q') {
    if (dr === 0 || dc === 0) {
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      for (let i = 1; i < Math.max(Math.abs(dr), Math.abs(dc)); i++) {
        if (board[fr + i * stepR][fc + i * stepC]) return false;
      }
      return true;
    }
    if (Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr / Math.abs(dr), stepC = dc / Math.abs(dc);
      for (let i = 1; i < Math.abs(dr); i++) {
        if (board[fr + i * stepR][fc + i * stepC]) return false;
      }
      return true;
    }
    return false;
  }
  return false;
};

export default function Chess({ onGameEnd }) {
  const [board, setBoard] = useState(initBoard());
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState('w');
  const [status, setStatus] = useState('');
  const [captures, setCaptures] = useState({ w: [], b: [] });

  const handleClick = (r, c) => {
    if (status) return;
    const piece = board[r][c];
    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) { setSelected(null); return; }
      if (isValidMove(board, selected, [r, c], turn)) {
        const newBoard = board.map(row => [...row]);
        const captured = newBoard[r][c];
        newBoard[r][c] = newBoard[sr][sc];
        newBoard[sr][sc] = null;
        const newCaptures = { ...captures };
        if (captured) newCaptures[turn] = [...newCaptures[turn], captured];
        setCaptures(newCaptures);
        if (captured === 'wK') { setStatus('Zwart wint! 🏆'); onGameEnd?.(100); }
        else if (captured === 'bK') { setStatus('Wit wint! 🏆'); onGameEnd?.(100); }
        setBoard(newBoard);
        setTurn(turn === 'w' ? 'b' : 'w');
        setSelected(null);
      } else if (piece && getColor(piece) === turn) {
        setSelected([r, c]);
      } else {
        setSelected(null);
      }
    } else {
      if (piece && getColor(piece) === turn) setSelected([r, c]);
    }
  };

  const reset = () => {
    setBoard(initBoard());
    setSelected(null);
    setTurn('w');
    setStatus('');
    setCaptures({ w: [], b: [] });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full text-sm text-slate-300">
        <span>Beurt: {turn === 'w' ? '⬜ Wit' : '⬛ Zwart'}</span>
        {status && <span className="text-yellow-400 font-bold">{status}</span>}
        <button onClick={reset} className="px-3 py-1 bg-purple-600 rounded text-white text-xs">Opnieuw</button>
      </div>
      <div className="border border-slate-600 rounded overflow-hidden">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((piece, c) => {
              const isLight = (r + c) % 2 === 0;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isValidTarget = selected && isValidMove(board, selected, [r, c], turn);
              return (
                <div
                  key={c}
                  onClick={() => handleClick(r, c)}
                  className={`w-9 h-9 flex items-center justify-center cursor-pointer text-xl select-none transition-all
                    ${isSelected ? 'bg-yellow-400/70' : isValidTarget ? (isLight ? 'bg-green-300/70' : 'bg-green-600/70') : isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    hover:opacity-80`}
                >
                  {piece ? PIECES[piece] : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-400">
        Wit pakt: {captures.w.map(p => PIECES[p]).join(' ')} | Zwart pakt: {captures.b.map(p => PIECES[p]).join(' ')}
      </div>
    </div>
  );
}
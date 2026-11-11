import React, { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Loader2, Terminal as TerminalIcon, X } from 'lucide-react';
import { TERMINAL_COMMANDS, commandRank, findTerminalCommand, runTerminalCommand } from '@/lib/terminalCommands';
import { getArgSuggestions } from '@/lib/terminalSuggestions';
import { asItems, getTerminalAccess, terminalLevelLabel } from '@/lib/terminalShared';

const DEFAULT_PASSWORD = 'GAMEZONE';

export default function GameTerminal({ open, onClose, user }) {
  const [passwordCheck, setPasswordCheck] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState({ level: 'kijk', rank: 1, isAdmin: false });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [highlight, setHighlight] = useState(0);
  const [size, setSize] = useState(null);
  const [players, setPlayers] = useState([]);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);
  const boxRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getTerminalAccess(user)
      .then(setAccess)
      .catch(() => setAccess({ level: 'kijk', rank: 1, isAdmin: false }));
  }, [user]);

  useEffect(() => {
    if (access.rank < 2) return;
    base44.entities.User.list()
      .then(list => setPlayers(asItems(list)))
      .catch(() => setPlayers([]));
  }, [access.rank]);

  useEffect(() => {
    const move = (e) => {
      const point = e.touches ? e.touches[0] : e;
      if (dragStart.current) {
        const dx = point.clientX - dragStart.current.x;
        const dy = point.clientY - dragStart.current.y;
        setOffset({
          x: Math.max(-180, Math.min(180, dragStart.current.baseX + dx)),
          y: Math.max(-180, Math.min(180, dragStart.current.baseY + dy)),
        });
      }
      if (resizeStart.current) {
        const maxW = Math.max(260, window.innerWidth - 16);
        const maxH = Math.max(220, window.innerHeight - 16);
        setSize({
          w: Math.max(260, Math.min(maxW, resizeStart.current.w + (point.clientX - resizeStart.current.x))),
          h: Math.max(200, Math.min(maxH, resizeStart.current.h + (point.clientY - resizeStart.current.y))),
        });
      }
    };
    const end = () => { dragStart.current = null; resizeStart.current = null; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, []);

  const parsedInput = useMemo(() => {
    const parts = input.replace(/^\//, '').split(/\s+/);
    return {
      name: (parts[0] || '').toLowerCase(),
      args: parts.slice(1),
      hasArgPhase: parts.length > 1,
    };
  }, [input]);

  const suggestions = useMemo(() => {
    const { name, args, hasArgPhase } = parsedInput;
    if (!hasArgPhase) {
      if (!name) return [];
      return TERMINAL_COMMANDS
        .filter(c => commandRank(c) <= access.rank && c.name.startsWith(name) && c.name !== name)
        .slice(0, 6)
        .map(c => ({ key: c.name, value: c.name, label: c.name, hint: c.description, isCommand: true }));
    }
    const command = TERMINAL_COMMANDS.find(c => c.name === name && commandRank(c) <= access.rank);
    if (!command) return [];
    return getArgSuggestions(name, args, { users: players, admin: access.rank >= 4 })
      .map(option => ({ key: option.value, ...option }));
  }, [parsedInput, access.rank, players]);

  const activeHint = useMemo(() => {
    const { name, hasArgPhase } = parsedInput;
    if (!hasArgPhase) return '';
    const command = TERMINAL_COMMANDS.find(c => c.name === name && commandRank(c) <= access.rank);
    return command ? command.description : '';
  }, [parsedInput, access.rank]);

  const applySuggestion = (suggestion) => {
    if (suggestion.isCommand) {
      setInput(`${suggestion.value} `);
    } else {
      const parts = input.replace(/^\//, '').split(/\s+/);
      parts[parts.length - 1] = suggestion.value;
      setInput(`${parts.join(' ')} `);
    }
    setHighlight(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') { execute(input); return; }
    if (suggestions.length === 0) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(suggestions[Math.min(highlight, suggestions.length - 1)]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => (h - 1 + suggestions.length) % suggestions.length);
    }
  };

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    resizeStart.current = { x: point.clientX, y: point.clientY, w: rect.width, h: rect.height };
  };

  const startDrag = (e) => {
    const point = e.touches ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, baseX: offset.x, baseY: offset.y };
  };

  useEffect(() => {
    if (!open) return;
    setUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
    setLines([]);
    setInput('');
    setPasswordCheck(null);
    setOffset({ x: 0, y: 0 });
    setSize(null);
    base44.entities.SiteSettings.filter({ key: 'terminal_password' })
      .then(list => {
        const items = Array.isArray(list) ? list : list?.items || [];
        setPasswordCheck(items[0]?.value || DEFAULT_PASSWORD);
      })
      .catch(() => setPasswordCheck(DEFAULT_PASSWORD));
  }, [open]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [lines, busy]);

  useEffect(() => {
    if (unlocked && inputRef.current) inputRef.current.focus();
  }, [unlocked]);

  const submitPassword = () => {
    if (passwordCheck === null) return;
    if (passwordInput.trim().toUpperCase() === String(passwordCheck).trim().toUpperCase()) {
      setUnlocked(true);
      setPasswordError('');
      setLines([
        'GAMEZONE TERMINAL v1.0',
        `Welkom, ${user?.full_name || 'Speler'}.`,
        `Niveau: ${terminalLevelLabel(access.level)}`,
        'Typ "help" voor jouw codes.',
        '',
      ]);
    } else {
      setPasswordError('Onjuist wachtwoord.');
      setPasswordInput('');
    }
  };

  const execute = async (raw) => {
    const command = raw.trim();
    if (!command || busy) return;
    const tokens = command.split(/\s+/);
    const name = tokens[0].replace(/^\//, '').toLowerCase();
    const args = tokens.slice(1);
    setInput('');

    if (name === 'clear' || name === 'cls') {
      setLines([]);
      return;
    }
    if (name === 'exit' || name === 'quit') {
      onClose();
      return;
    }

    const found = findTerminalCommand(name);
    if (!found) {
      setLines(prev => [...prev, `> ${command}`, `Onbekende code: ${command}. Typ "help".`]);
      return;
    }

    setLines(prev => [...prev, `> ${command}`]);
    setBusy(true);
    try {
      const output = await runTerminalCommand(found, { user, args, admin: access.rank >= 4, rank: access.rank, level: access.level });
      setLines(prev => [...prev, ...output]);
      base44.entities.TerminalLog.create({
        user_email: user?.email || '',
        user_name: user?.full_name || user?.email || 'Onbekend',
        command,
        level: access.level,
      }).catch(() => {});
    } catch (error) {
      setLines(prev => [...prev, 'Er ging iets mis bij het uitvoeren.']);
    }
    setBusy(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-3">
      <div
        ref={boxRef}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          ...(size ? { width: `${size.w}px`, height: `${size.h}px` } : {}),
        }}
        className={`pointer-events-auto relative w-full flex flex-col rounded-xl border border-green-500/40 bg-[#050a05] shadow-2xl shadow-black/70 overflow-hidden ${size ? '' : 'max-w-md h-[56vh]'}`}
      >
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="flex items-center gap-2 px-3 py-2 border-b border-green-500/30 bg-[#0a140a] cursor-move touch-none select-none"
        >
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="flex-1 text-green-400 font-mono text-xs flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5" /> gamezone@terminal
            <span className="text-green-700 text-[10px]">· {access.level}</span>
          </span>
          <button onClick={onClose} className="text-green-500/70 hover:text-green-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!unlocked ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
                <Lock className="w-7 h-7 text-green-400" />
              </div>
              <p className="text-green-400 font-mono text-sm mb-4">Wachtwoord vereist</p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-black/60 border border-green-500/40 rounded-md px-3 py-2 text-center font-mono text-green-300 tracking-widest focus:outline-none focus:border-green-400"
              />
              {passwordError && <p className="text-red-400 font-mono text-xs mt-2">{passwordError}</p>}
              <button
                onClick={submitPassword}
                disabled={passwordCheck === null || !passwordInput.trim()}
                className="w-full mt-4 bg-green-600/90 hover:bg-green-600 disabled:opacity-40 text-black font-mono text-sm py-2 rounded-md flex items-center justify-center gap-2"
              >
                {passwordCheck === null ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ontgrendelen'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={endRef} className="flex-1 overflow-auto p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-green-300">
              {lines.map((line, index) => (
                <div key={index} className={line.startsWith('>') ? 'text-green-500' : 'whitespace-pre-wrap'}>
                  {line || '\u00A0'}
                </div>
              ))}
              {busy && <div className="text-green-500 animate-pulse">bezig...</div>}
            </div>
            <div className="relative border-t border-green-500/30 bg-[#0a140a]">
              {activeHint && (
                <div className="px-4 pt-1.5 pb-0.5 font-mono text-[10px] text-green-700 truncate">gebruik: {activeHint}</div>
              )}
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 border-t border-green-500/30 bg-[#07100a] max-h-40 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.key}
                      onMouseDown={(e) => { e.preventDefault(); applySuggestion(suggestion); }}
                      className={`w-full text-left px-3 py-1.5 flex items-baseline gap-2 font-mono text-[11px] ${
                        index === highlight ? 'bg-green-500/20 text-green-200' : 'text-green-500/80'
                      }`}
                    >
                      <span className="text-green-300 shrink-0 truncate max-w-[55%]">{suggestion.label}</span>
                      <span className="text-green-700 truncate">{suggestion.hint}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-green-500 font-mono text-sm">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setHighlight(0); }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="typ een code..."
                  className="flex-1 bg-transparent border-none outline-none text-green-300 font-mono text-sm placeholder:text-green-700"
                  autoComplete="off"
                />
                <span className="hidden sm:inline text-green-800 font-mono text-[10px]">tab = aanvullen</span>
              </div>
              <button
                onMouseDown={startResize}
                onTouchStart={startResize}
                title="Sleep om het venster groter of kleiner te maken"
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize touch-none text-green-600/60 hover:text-green-400 flex items-end justify-end"
              >
                <span className="block w-3.5 h-3.5 border-r-2 border-b-2 border-current rounded-br-sm" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
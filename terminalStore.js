import { useEffect, useState } from 'react';

let isOpen = false;
const listeners = new Set();

export function setTerminalOpen(value) {
  isOpen = value;
  listeners.forEach((listener) => listener(isOpen));
}

export function openTerminal() {
  setTerminalOpen(true);
}

export function closeTerminal() {
  setTerminalOpen(false);
}

export function useTerminalOpen() {
  const [value, setValue] = useState(isOpen);

  useEffect(() => {
    listeners.add(setValue);
    setValue(isOpen);
    return () => listeners.delete(setValue);
  }, []);

  return value;
}
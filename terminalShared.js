import { base44 } from '@/api/base44Client';

export const asItems = (result) => (Array.isArray(result) ? result : result?.items || []);

export const scoreName = (user) => user?.full_name || user?.email || 'Speler';

export const SUPER_EMAILS = ['s.olivier@werkschuit-haarlem.nl', 's.olivier@student.werkschuit-haarlem.nl'];

export const ADMIN_TAB_IDS = [
  'live', 'videos', '99x', 'stats', 'scores', 'punten', 'reviews', 'bannen', 'games',
  'bericht', 'polls', 'site', 'schermen', 'chat', 'toegang', 'codes', 'gamedoorelkaar',
  'blindness', 'vragen', 'tekst', 'cms', 'link', 'code', 'terminal',
];

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const randomCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i += 1) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export const isAdminUser = async (user) => {
  if (!user) return false;
  if (user.role === 'admin' || SUPER_EMAILS.includes(user.email)) return true;
  try {
    if (localStorage.getItem('__giveSuperadmin') === 'true') return true;
  } catch {
    // geen localStorage
  }
  const access = asItems(await base44.entities.AdminAccess.filter({ user_email: user.email }));
  return access.length > 0;
};

export const findUser = async (email) => {
  if (!email) return null;
  const users = asItems(await base44.entities.User.list());
  return users.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
};

export const saveSetting = async (key, value, description) => {
  const list = asItems(await base44.entities.SiteSettings.filter({ key }));
  if (list[0]) {
    await base44.entities.SiteSettings.update(list[0].id, { value });
  } else {
    await base44.entities.SiteSettings.create({ key, value, description: description || key });
  }
};

export const sendReloadSignal = () => saveSetting('reload_signal', Date.now().toString(), 'Reload signaal voor alle gebruikers');

export const TERMINAL_LEVELS = [
  { id: 'kijk', rank: 1, label: 'Alleen kijken', description: 'informatie-codes (help, points, top, clans, players)' },
  { id: 'punten', rank: 2, label: 'Punten', description: 'kijken + punten geven aan spelers' },
  { id: 'beheer', rank: 3, label: 'Beheer', description: 'moderatie, berichten, polls, events en codes maken' },
  { id: 'volledig', rank: 4, label: 'Volledig', description: 'alles, inclusief toegang geven en boosts' },
];

export const terminalLevelRank = (level) =>
  TERMINAL_LEVELS.find(l => l.id === String(level || '').toLowerCase())?.rank || 1;

export const terminalLevelLabel = (level) =>
  TERMINAL_LEVELS.find(l => l.id === String(level || '').toLowerCase())?.label || 'Alleen kijken';

export const isSuperUser = (user) => {
  if (!user) return false;
  if (user.role === 'admin' || SUPER_EMAILS.includes(user.email)) return true;
  try {
    return localStorage.getItem('__giveSuperadmin') === 'true';
  } catch {
    return false;
  }
};

/**
 * Bepaalt de terminal-rechten van een gebruiker.
 * Eigen instelling (TerminalAccess) gaat voor, anders het hoogste niveau van de
 * terminal-codes die de gebruiker heeft ingewisseld.
 */
export const getTerminalAccess = async (user) => {
  if (isSuperUser(user)) return { level: 'volledig', rank: 4, isAdmin: true };
  if (!user?.email) return { level: 'kijk', rank: 1, isAdmin: false };

  const own = asItems(await base44.entities.TerminalAccess.filter({ user_email: user.email }));
  if (own[0]?.level) {
    return { level: own[0].level, rank: terminalLevelRank(own[0].level), isAdmin: false };
  }

  const codes = asItems(await base44.entities.RedeemCode.filter({ reward_type: 'terminal' }));
  const level = codes
    .filter(c => (c.used_by || []).includes(user.email))
    .reduce((best, c) => {
      const value = c.terminal_level || 'volledig';
      return terminalLevelRank(value) > terminalLevelRank(best) ? value : best;
    }, 'kijk');

  return { level, rank: terminalLevelRank(level), isAdmin: false };
};
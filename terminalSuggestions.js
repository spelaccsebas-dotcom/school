import { TERMINAL_LEVELS } from '@/lib/terminalShared';

const playerOptions = (users) => (users || [])
  .filter(u => u?.email)
  .map(u => ({ value: u.email, label: u.full_name || u.email, hint: 'speler' }));

const SUBCOMMANDS = (items) => items.map(([value, hint]) => ({ value, label: value, hint }));

const levelOptions = () => SUBCOMMANDS(TERMINAL_LEVELS.map(l => [l.id, l.label]));

const OPTIONS = {
  give: (args, { users, admin }) => {
    if (args.length <= 1) {
      return SUBCOMMANDS([
        ['punten', 'geef punten aan iemand'],
        ['superadmin', 'geef Super Admin toegang'],
      ]);
    }
    const type = (args[0] || '').toLowerCase();
    if (!['punten', 'points', 'superadmin', 'admin'].includes(type)) return [];
    if (['superadmin', 'admin'].includes(type) && !admin) return [];
    return playerOptions(users);
  },
  take: (args, { users }) => (args.length <= 1
    ? SUBCOMMANDS([['punten', 'haal punten af']])
    : playerOptions(users)),
  ban: (args, { users }) => playerOptions(users),
  unban: (args, { users }) => playerOptions(users),
  kick: (args, { users }) => playerOptions(users),
  admin: (args, { users }) => playerOptions(users),
  unadmin: (args, { users }) => playerOptions(users),
  boost: (args, { users }) => playerOptions(users),
  onderhoud: () => SUBCOMMANDS([['aan', 'onderhoud aan'], ['uit', 'onderhoud uit']]),
  blind: () => SUBCOMMANDS([['stop', 'stop het event']]),
  mix: () => SUBCOMMANDS([['stop', 'stop het event']]),
  msg: () => SUBCOMMANDS([['wis', 'alle berichten wissen']]),
  code: (args) => {
    if (args.length <= 1) {
      return SUBCOMMANDS([
        ['punten', 'code voor punten'],
        ['multiplier', 'code voor multiplier'],
        ['superadmin', 'code voor toegang'],
        ['terminal', 'code voor de terminal'],
      ]);
    }
    return (args[0] || '').toLowerCase() === 'terminal' ? levelOptions() : [];
  },
  rechten: (args, { users }) => (args.length <= 1
    ? [...playerOptions(users), ...SUBCOMMANDS([['weg', 'rechten weghalen']])]
    : levelOptions()),
};

/**
 * Suggesties voor de argumenten die na een commando getypt worden.
 * args bevat ook het stuk dat nu getypt wordt (kan leeg zijn).
 */
export const getArgSuggestions = (name, args = [], context = {}) => {
  const build = OPTIONS[name];
  if (!build) return [];
  const typed = (args[args.length - 1] || '').toLowerCase();
  return build(args, context)
    .filter(option => {
      const value = option.value.toLowerCase();
      const label = (option.label || '').toLowerCase();
      if (value === typed) return false;
      if (!typed) return true;
      return value.includes(typed) || label.includes(typed);
    })
    .slice(0, 6);
};
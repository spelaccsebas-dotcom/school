import { base44 } from '@/api/base44Client';
import {
  asItems, scoreName, findUser, isEmail, ADMIN_TAB_IDS, TERMINAL_LEVELS, terminalLevelRank, terminalLevelLabel,
} from '@/lib/terminalShared';
import { ADMIN_COMMANDS } from '@/lib/terminalAdminCommands';

const rewardText = (code) => {
  if (code.reward_type === 'punten') return `${code.points || 0} punten`;
  if (code.reward_type === 'multiplier_tijd') return `${code.multiplier || 2}X multiplier voor ${code.multiplier_minutes || 60} min`;
  if (code.reward_type === 'superadmin') return `Super Admin toegang${code.superadmin_tabs?.length ? ` (${code.superadmin_tabs.length} tabs)` : ''}`;
  if (code.reward_type === 'terminal') return `Terminal: ${code.terminal_level || 'volledig'}`;
  return code.reward_type;
};

const addPoints = async (user, args, sign) => {
  const email = (args || []).find(a => isEmail(a));
  const amount = Number((args || []).find(a => /^\d+$/.test(a))) || 100;
  const target = email ? await findUser(email) : user;
  if (email && !target) return [`Geen account gevonden met ${email}.`];
  const name = scoreName(target || { email });
  await base44.entities.Score.create({ game: 'Terminal', score: sign * amount, player_name: name });
  return [`${amount} punten ${sign > 0 ? 'toegevoegd aan' : 'afgehaald bij'} ${name}.`];
};

const GIVE_USAGE = 'give punten <aantal> [email] · give superadmin [email]';

const BASE_COMMANDS = [
  {
    name: 'help',
    description: 'Toon de codes die jij mag gebruiken',
    level: 'kijk',
    run: async ({ rank, level }) => [
      'Beschikbare codes:',
      ...TERMINAL_COMMANDS
        .filter(c => commandRank(c) <= rank)
        .map(c => `  ${c.name.padEnd(12, ' ')} ${c.description}`),
      '',
      `Jouw terminal-niveau: ${terminalLevelLabel(level)}`,
    ],
  },
  {
    name: 'whoami',
    description: 'Laat zien wie je bent en welk niveau je hebt',
    level: 'kijk',
    run: async ({ user, rank, level }) => [
      `Speler: ${scoreName(user)}`,
      `Niveau: ${terminalLevelLabel(level)}${rank >= 4 ? ' (super admin)' : ''}`,
    ],
  },
  {
    name: 'niveaus',
    description: 'Uitleg van alle terminal-niveaus',
    level: 'kijk',
    run: async () => [
      'Terminal-niveaus:',
      ...TERMINAL_LEVELS.map(l => `  ${l.id.padEnd(10, ' ')} ${l.label} — ${l.description}`),
    ],
  },
  {
    name: 'points',
    description: 'Je totale punten',
    level: 'kijk',
    run: async ({ user }) => {
      const scores = asItems(await base44.entities.Score.filter({ player_name: scoreName(user) }));
      const total = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      return [`Je hebt in totaal ${total} punten met ${scores.length} scores.`];
    },
  },
  {
    name: 'top',
    description: 'De top 5 spelers',
    level: 'kijk',
    run: async () => {
      const scores = asItems(await base44.entities.Score.list('-score', 300));
      const best = {};
      scores.forEach(s => {
        const name = s.player_name || 'Speler';
        if (!best[name] || s.score > best[name]) best[name] = s.score;
      });
      const top = Object.entries(best).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (top.length === 0) return ['Nog geen scores gevonden.'];
      return ['Top 5 spelers:', ...top.map(([name, score], i) => `  ${i + 1}. ${name} — ${score} punten`)];
    },
  },
  {
    name: 'codes',
    description: 'Alle inwisselcodes en wat ze doen',
    level: 'beheer',
    run: async () => {
      const codes = asItems(await base44.entities.RedeemCode.list());
      if (codes.length === 0) return ['Er zijn nog geen codes.'];
      return [
        `Alle codes (${codes.length}):`,
        ...codes.map(c => `  ${c.code.padEnd(16, ' ')} ${rewardText(c)}${c.active ? '' : ' [uit]'}`),
      ];
    },
  },
  {
    name: 'clans',
    description: 'Clans en jouw clan',
    level: 'kijk',
    run: async ({ user }) => {
      const clans = asItems(await base44.entities.Clan.list());
      const mine = clans.find(c => (c.members || []).includes(user?.email) || c.owner_email === user?.email);
      return [
        `Er zijn ${clans.length} clans.`,
        mine ? `Jouw clan: ${mine.icon || '🛡️'} ${mine.name} (${mine.total_points || 0} punten)` : 'Je zit nog in geen clan.',
      ];
    },
  },
  {
    name: 'players',
    description: 'Aantal spelers en scores',
    level: 'kijk',
    run: async () => {
      const users = asItems(await base44.entities.User.list());
      const scores = asItems(await base44.entities.Score.list());
      return [`${users.length} spelers · ${scores.length} scores in de database.`];
    },
  },
  {
    name: 'give',
    description: GIVE_USAGE,
    level: 'punten',
    run: async ({ user, args, admin }) => {
      const what = (args?.[0] || '').toLowerCase();
      const email = (args || []).find(a => isEmail(a));

      if (what === 'punten' || what === 'points') {
        return addPoints(user, (args || []).slice(1), 1);
      }
      if (what === 'superadmin' || what === 'admin') {
        if (!email) {
          localStorage.setItem('__giveSuperadmin', 'true');
          return [
            'Super Admin toegang geactiveerd.',
            'Herlaad de pagina om de Super Admin pagina te zien.',
          ];
        }
        if (!admin) return ['Alleen een Super Admin kan toegang aan een ander account geven.'];
        const target = await findUser(email);
        if (!target) return [`Geen account gevonden met ${email}.`];
        const existing = asItems(await base44.entities.AdminAccess.filter({ user_email: target.email }));
        if (existing[0]) {
          await base44.entities.AdminAccess.update(existing[0].id, { allowed_tabs: ADMIN_TAB_IDS });
        } else {
          await base44.entities.AdminAccess.create({
            user_email: target.email,
            user_name: target.full_name || '',
            allowed_tabs: ADMIN_TAB_IDS,
          });
        }
        return [`Super Admin toegang gegeven aan ${target.full_name || target.email}.`];
      }
      return [`Gebruik: ${GIVE_USAGE}`];
    },
  },
  {
    name: 'take',
    description: 'take punten <aantal> [email] — punten afhalen',
    level: 'beheer',
    run: async ({ user, args }) => addPoints(user, (args || []).slice(1), -1),
  },
  {
    name: 'matrix',
    description: 'Easter egg',
    level: 'kijk',
    run: async () => [
      '01000111 01000001 01001101 01000101 01011010 01001111 01001110 01000101',
      'Welkom in de matrix, agent.',
      '   ░▒▓█ GAMEZONE █▓▒░',
    ],
  },
  {
    name: 'clear',
    description: 'Maak het scherm leeg',
    level: 'kijk',
    run: async () => [],
  },
  {
    name: 'exit',
    description: 'Sluit de terminal',
    level: 'kijk',
    run: async () => [],
  },
];

export const TERMINAL_COMMANDS = [...BASE_COMMANDS, ...ADMIN_COMMANDS];

export const commandRank = (command) => terminalLevelRank(command?.level || 'kijk');

export const findTerminalCommand = (name) =>
  TERMINAL_COMMANDS.find(c => c.name === String(name).trim().toLowerCase());

export const runTerminalCommand = async (command, context = {}) => {
  const rank = context.rank ?? (context.admin ? 4 : 1);
  if (rank < commandRank(command)) {
    return [`Geen toegang. Deze code hoort bij niveau "${terminalLevelLabel(command.level || 'kijk')}".`];
  }
  return command.run({ ...context, rank });
};
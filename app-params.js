import { base44 } from '@/api/base44Client';
import { DEFAULT_SITE_TEXTS } from '@/lib/siteTexts';
import { TERMINAL_LEVELS, ADMIN_TAB_IDS } from '@/lib/terminalShared';

export const TEKST_KEYS = Object.keys(DEFAULT_SITE_TEXTS);

const LEVELS = TERMINAL_LEVELS.map(l => `${l.id} = ${l.label}`).join(', ');

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const saveSetting = async (key, value, description) => {
  const existing = items(await base44.entities.SiteSettings.filter({ key }));
  if (existing[0]) {
    await base44.entities.SiteSettings.update(existing[0].id, { value });
  } else {
    await base44.entities.SiteSettings.create({ key, value, description });
  }
};

const getCustomTexts = async () => {
  const existing = items(await base44.entities.SiteSettings.filter({ key: 'site_texts' }));
  if (!existing[0]) return {};
  try { return JSON.parse(existing[0].value || '{}'); } catch (e) { return {}; }
};

const saveCustomTexts = async (custom) => {
  await saveSetting('site_texts', JSON.stringify(custom), 'Aangepaste website teksten');
};

export const AI_SCHEMA = {
  type: 'object',
  properties: {
    antwoord: { type: 'string', description: 'Kort antwoord in het Nederlands aan de beheerder.' },
    acties: {
      type: 'array',
      description: 'Uit te voeren acties. Laat leeg als er niets uitgevoerd hoeft te worden.',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: [
              'site_tekst', 'site_tekst_reset', 'bericht', 'bericht_weg',
              'onderhoud', 'herladen', 'punten', 'code', 'code_weg',
              'poll', 'poll_weg', 'ban', 'unban',
              'admin_toegang', 'admin_toegang_weg', 'terminal_toegang', 'terminal_toegang_weg',
            ],
          },
          key: { type: 'string' },
          value: { type: 'string' },
          tekst: { type: 'string' },
          niveau: { type: 'string' },
          aan: { type: 'boolean' },
          naam: { type: 'string' },
          punten: { type: 'number' },
          game: { type: 'string' },
          code: { type: 'string' },
          reward_type: { type: 'string' },
          terminal_level: { type: 'string' },
          tabs: { type: 'array', items: { type: 'string' } },
          multiplier: { type: 'number' },
          multiplier_minuten: { type: 'number' },
          max_uses: { type: 'number' },
          vraag: { type: 'string' },
          opties: { type: 'array', items: { type: 'string' } },
          email: { type: 'string' },
          reden: { type: 'string' },
        },
        required: ['type'],
      },
    },
  },
  required: ['antwoord'],
};

export const buildPrompt = (vraag, customTexts) => `Je bent de beheer-AI van deze gamewebsite. Je voert zelf aanpassingen door en kunt ook dingen verwijderen.

ACTIES:
1. site_tekst — pas een vaste tekst aan. Velden: key (een van de sleutels onderaan), value.
2. site_tekst_reset — zet een tekst terug naar de standaard. Velden: key (leeg = alle teksten terug).
3. bericht — toon een banner voor alle gebruikers. Velden: tekst, niveau (info, warning of alert).
4. bericht_weg — verwijder alle actieve banners.
5. onderhoud — website in of uit onderhoud. Velden: aan (true/false).
6. herladen — herlaad de pagina bij alle gebruikers.
7. punten — geef een speler punten. Velden: naam (spelersnaam of e-mail), punten, game (optioneel).
8. code — maak een inwisselcode. Velden: code, reward_type (punten, multiplier_tijd, superadmin of terminal), punten, multiplier, multiplier_minuten, max_uses, terminal_level (${LEVELS}), tabs (alleen bij superadmin: lijst met toegangs-tabs).
9. code_weg — verwijder een code. Velden: code.
10. poll — maak een poll. Velden: vraag, opties (lijst korte teksten).
11. poll_weg — verwijder een poll. Velden: vraag (leeg = alle actieve polls).
12. ban — ban een gebruiker. Velden: email, naam, reden.
13. unban — haal een ban weg. Velden: email.
14. admin_toegang — geef Super Admin toegang. Velden: email, tabs (leeg = standaardset).
15. admin_toegang_weg — neem Super Admin toegang af. Velden: email.
16. terminal_toegang — geef of wijzig terminalrechten. Velden: email, terminal_level (${LEVELS}).
17. terminal_toegang_weg — neem terminalrechten af. Velden: email.

Toegangs-tabs: ${ADMIN_TAB_IDS.join(', ')}.

Huidige aangepaste teksten: ${JSON.stringify(customTexts)}

Sleutels voor site_tekst: ${TEKST_KEYS.join(', ')}.

Verzoek van de beheerder: "${vraag}"

Regels:
- Antwoord kort in het Nederlands in "antwoord".
- Zet alleen acties in "acties" die echt uit het verzoek volgen, ook als het om verwijderen gaat.
- Verzin nooit gegevens die de beheerder niet noemde; vraag er anders naar in "antwoord" en laat "acties" leeg.
- Past het verzoek nergens bij, laat "acties" leeg en leg uit wat wel kan.`;

export const getCurrentTexts = getCustomTexts;

export const applyAction = async (action, user) => {
  switch (action.type) {
    case 'site_tekst': {
      if (!TEKST_KEYS.includes(action.key)) {
        return { ok: false, label: `Onbekende tekstsleutel: ${action.key || '?'}` };
      }
      const custom = await getCustomTexts();
      custom[action.key] = action.value || '';
      await saveCustomTexts(custom);
      return { ok: true, label: `Tekst "${action.key}" aangepast` };
    }

    case 'site_tekst_reset': {
      const custom = await getCustomTexts();
      if (action.key) {
        if (!TEKST_KEYS.includes(action.key)) {
          return { ok: false, label: `Onbekende tekstsleutel: ${action.key}` };
        }
        delete custom[action.key];
        await saveCustomTexts(custom);
        return { ok: true, label: `Tekst "${action.key}" teruggezet` };
      }
      await saveCustomTexts({});
      return { ok: true, label: 'Alle teksten teruggezet' };
    }

    case 'bericht': {
      if (!action.tekst) return { ok: false, label: 'Banner: geen tekst opgegeven' };
      await base44.entities.AdminMessage.create({
        message: action.tekst,
        type: ['info', 'warning', 'alert'].includes(action.niveau) ? action.niveau : 'info',
        active: true,
        sender_name: user?.full_name || 'AI Beheer',
      });
      return { ok: true, label: `Banner geplaatst: ${action.tekst}` };
    }

    case 'bericht_weg': {
      const list = items(await base44.entities.AdminMessage.filter({ active: true }));
      await Promise.all(list.map(m => base44.entities.AdminMessage.delete(m.id)));
      return { ok: true, label: `${list.length} banner(s) verwijderd` };
    }

    case 'onderhoud': {
      await saveSetting('maintenance', action.aan ? 'true' : 'false', 'Website in onderhoudsmodus');
      return { ok: true, label: action.aan ? 'Onderhoudsmodus aan' : 'Onderhoudsmodus uit' };
    }

    case 'herladen': {
      await saveSetting('reload_signal', String(Date.now()), 'Reload signaal voor alle gebruikers');
      return { ok: true, label: 'Alle gebruikers herladen' };
    }

    case 'punten': {
      if (!action.naam || !action.punten) return { ok: false, label: 'Punten: speler of aantal ontbreekt' };
      await base44.entities.Score.create({
        player_name: action.naam,
        score: Number(action.punten),
        game: action.game || 'AI Bonus',
      });
      return { ok: true, label: `${action.punten} punten voor ${action.naam}` };
    }

    case 'code': {
      if (!action.code) return { ok: false, label: 'Code: geen code opgegeven' };
      await base44.entities.RedeemCode.create({
        code: String(action.code).toUpperCase(),
        reward_type: action.reward_type || 'punten',
        points: Number(action.punten) || 0,
        multiplier: Number(action.multiplier) || 0,
        multiplier_minutes: Number(action.multiplier_minuten) || 0,
        max_uses: action.max_uses ?? 1,
        terminal_level: action.terminal_level || 'volledig',
        superadmin_tabs: action.tabs || [],
        uses: 0,
        used_by: [],
        active: true,
        description: 'Aangemaakt via AI Beheer',
      });
      return { ok: true, label: `Code ${String(action.code).toUpperCase()} aangemaakt` };
    }

    case 'code_weg': {
      if (!action.code) return { ok: false, label: 'Code verwijderen: geen code opgegeven' };
      const list = items(await base44.entities.RedeemCode.filter({ code: String(action.code).toUpperCase() }));
      await Promise.all(list.map(c => base44.entities.RedeemCode.delete(c.id)));
      return list.length > 0
        ? { ok: true, label: `Code ${String(action.code).toUpperCase()} verwijderd` }
        : { ok: false, label: `Code ${String(action.code).toUpperCase()} niet gevonden` };
    }

    case 'poll': {
      if (!action.vraag || !action.opties?.length) return { ok: false, label: 'Poll: vraag of opties ontbreken' };
      await base44.entities.Poll.create({
        question: action.vraag,
        options: action.opties,
        votes: {},
        voters: [],
        active: true,
      });
      return { ok: true, label: `Poll aangemaakt: ${action.vraag}` };
    }

    case 'poll_weg': {
      const all = items(await base44.entities.Poll.list());
      const match = action.vraag
        ? all.filter(p => (p.question || '').toLowerCase().includes(String(action.vraag).toLowerCase()))
        : all.filter(p => p.active);
      await Promise.all(match.map(p => base44.entities.Poll.delete(p.id)));
      return { ok: true, label: `${match.length} poll(s) verwijderd` };
    }

    case 'ban': {
      if (!action.email) return { ok: false, label: 'Ban: geen e-mail opgegeven' };
      await base44.entities.Ban.create({
        user_email: action.email,
        user_name: action.naam || action.email,
        reason: action.reden || '',
        banned_by: user?.email || '',
      });
      return { ok: true, label: `${action.naam || action.email} geband` };
    }

    case 'unban': {
      if (!action.email) return { ok: false, label: 'Unban: geen e-mail opgegeven' };
      const list = items(await base44.entities.Ban.filter({ user_email: action.email }));
      await Promise.all(list.map(b => base44.entities.Ban.delete(b.id)));
      return { ok: true, label: `${action.email} unbanned` };
    }

    case 'admin_toegang': {
      if (!action.email) return { ok: false, label: 'Toegang: geen e-mail opgegeven' };
      const tabs = action.tabs?.length ? action.tabs : ['live', 'stats', 'scores', 'punten'];
      const existing = items(await base44.entities.AdminAccess.filter({ user_email: action.email }));
      if (existing[0]) {
        await base44.entities.AdminAccess.update(existing[0].id, { allowed_tabs: tabs });
      } else {
        await base44.entities.AdminAccess.create({
          user_email: action.email,
          user_name: action.naam || action.email,
          allowed_tabs: tabs,
        });
      }
      return { ok: true, label: `Super Admin toegang voor ${action.email}` };
    }

    case 'admin_toegang_weg': {
      if (!action.email) return { ok: false, label: 'Toegang wegnemen: geen e-mail opgegeven' };
      const list = items(await base44.entities.AdminAccess.filter({ user_email: action.email }));
      await Promise.all(list.map(a => base44.entities.AdminAccess.delete(a.id)));
      return { ok: true, label: `Super Admin toegang van ${action.email} verwijderd` };
    }

    case 'terminal_toegang': {
      if (!action.email) return { ok: false, label: 'Terminalrechten: geen e-mail opgegeven' };
      const level = TERMINAL_LEVELS.some(l => l.id === action.terminal_level) ? action.terminal_level : 'kijk';
      const existing = items(await base44.entities.TerminalAccess.filter({ user_email: action.email }));
      if (existing[0]) {
        await base44.entities.TerminalAccess.update(existing[0].id, { level, granted_by: user?.email || 'AI Beheer' });
      } else {
        await base44.entities.TerminalAccess.create({
          user_email: action.email,
          user_name: action.naam || action.email,
          level,
          granted_by: user?.email || 'AI Beheer',
        });
      }
      return { ok: true, label: `Terminalrechten ${level} voor ${action.email}` };
    }

    case 'terminal_toegang_weg': {
      if (!action.email) return { ok: false, label: 'Terminalrechten wegnemen: geen e-mail opgegeven' };
      const list = items(await base44.entities.TerminalAccess.filter({ user_email: action.email }));
      await Promise.all(list.map(t => base44.entities.TerminalAccess.delete(t.id)));
      return { ok: true, label: `Terminalrechten van ${action.email} verwijderd` };
    }

    default:
      return { ok: false, label: `Onbekende actie: ${action.type}` };
  }
};
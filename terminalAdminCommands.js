import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const DEFAULT_SITE_TEXTS = {
  'brand.name': 'GameZone',
  'nav.games': 'Games',
  'nav.scores': 'Scores',
  'nav.superadmin': 'Super Admin',
  'nav.media': 'Media',
  'nav.polls': 'Polls',
  'nav.codes': 'Codes',
  'nav.clans': 'Clans',
  'nav.info': 'Info',
  'nav.logout': 'Uitloggen',
  'home.badge': '65 games om te spelen!',
  'home.title': 'GameZone',
  'home.subtitle': 'Ontdek een wereld vol spannende games. Speel, scoor en word de beste!',
  'leaderboard.title': 'Scorebord',
  'leaderboard.tab.global': 'Algemeen',
  'leaderboard.tab.mine': 'Mijn Scores',
  'info.title': 'Over GameZone',
  'info.subtitle': 'Informatie over deze game platform',
};

export const SITE_TEXT_GROUPS = [
  { label: 'Merk', keys: ['brand.name'] },
  { label: 'Navigatie menu', keys: ['nav.games', 'nav.scores', 'nav.superadmin', 'nav.media', 'nav.polls', 'nav.codes', 'nav.clans', 'nav.info', 'nav.logout'] },
  { label: 'Home pagina', keys: ['home.badge', 'home.title', 'home.subtitle'] },
  { label: 'Scorebord', keys: ['leaderboard.title', 'leaderboard.tab.global', 'leaderboard.tab.mine'] },
  { label: 'Info pagina', keys: ['info.title', 'info.subtitle'] },
];

export function useSiteTexts() {
  const { data: setting = [] } = useQuery({
    queryKey: ['site-texts'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'site_texts' }).catch(() => []),
  });

  let custom = {};
  if (setting && setting.length > 0) {
    try { custom = JSON.parse(setting[0].value); } catch (e) {}
  }

  const t = (key) => custom[key] || DEFAULT_SITE_TEXTS[key] || key;
  return { t };
}
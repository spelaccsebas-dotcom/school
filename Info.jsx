import React from 'react';
import { motion } from 'framer-motion';
import { Info as InfoIcon, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSiteTexts } from '@/lib/siteTexts';
import { DEFAULT_INFO_CONTENT } from '@/components/InfoTekstTab';

const STAT_STYLES = [
  'bg-purple-500/10 text-purple-400',
  'bg-pink-500/10 text-pink-400',
  'bg-blue-500/10 text-blue-400',
  'bg-green-500/10 text-green-400',
];

export default function Info() {
  const { t } = useSiteTexts();
  const { data: setting = [] } = useQuery({
    queryKey: ['info-content-setting'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'info_content' }).catch(() => []),
  });

  let content = DEFAULT_INFO_CONTENT;
  if (setting && setting.length > 0) {
    try { content = { ...DEFAULT_INFO_CONTENT, ...JSON.parse(setting[0].value) }; } catch (e) {}
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <InfoIcon className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{t('info.title')}</h1>
          </div>
          <p className="text-slate-400">{t('info.subtitle')}</p>
        </motion.div>

        <div className="space-y-6">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">🎮</span>
              {content.aboutTitle}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">{content.aboutText}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {content.stats.map((stat, i) => {
                const style = STAT_STYLES[i] || 'bg-slate-500/10 text-slate-400';
                return (
                  <div key={i} className={`${style.split(' ')[0]} rounded-lg p-4`}>
                    <div className={`${style.split(' ')[1]} font-bold text-lg mb-1`}>{stat.label}</div>
                    <div className="text-slate-400 text-sm">{stat.desc}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-400" />
              {content.contactTitle}
            </h2>
            <p className="text-slate-300 mb-2">{content.contactText}</p>
            <a
              href={`mailto:${content.contactEmail}`}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {content.contactEmail}
            </a>
          </motion.div>

          {/* Version Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-slate-500 text-sm"
          >
            {content.versionText}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
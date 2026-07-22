import React from 'react';

interface Props {
  source: 'open_source_db' | 'scraped_web' | 'crowdsourced';
}

const sourceConfig = {
  open_source_db: {
    label: 'Community DB',
    icon: '📚',
    color: 'bg-green-100 text-green-700',
  },
  scraped_web: {
    label: 'Web Scrape',
    icon: '🕷️',
    color: 'bg-yellow-100 text-yellow-700',
  },
  crowdsourced: {
    label: 'Crowdsourced',
    icon: '👥',
    color: 'bg-purple-100 text-purple-700',
  },
};

export default function SourceBadge({ source }: Props) {
  const config = sourceConfig[source];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
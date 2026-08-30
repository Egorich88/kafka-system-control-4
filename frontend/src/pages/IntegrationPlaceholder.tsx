/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

import { useTranslation } from 'react-i18next';
import '../styles/integration-placeholder.css';

interface IntegrationPlaceholderProps {
  titleKey: string;
}

export default function IntegrationPlaceholder({
  titleKey
}: IntegrationPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <section className="integration-placeholder">
      <div className="integration-placeholder-card">
        <span className="integration-placeholder-kicker">
          {t('integration.comingSoon')}
        </span>
        <h1>{t(titleKey)}</h1>
        <p>{t('integration.description')}</p>
      </div>
    </section>
  );
}

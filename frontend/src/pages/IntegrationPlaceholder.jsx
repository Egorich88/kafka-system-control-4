import { useTranslation } from 'react-i18next';
import '../styles/integration-placeholder.css';

export default function IntegrationPlaceholder({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="integration-placeholder">
      <section className="integration-placeholder-card">
        <span className="integration-placeholder-kicker">{t('integration.comingSoon')}</span>
        <h1>{t(titleKey)}</h1>
        <p>{t('integration.description')}</p>
      </section>
    </div>
  );
}

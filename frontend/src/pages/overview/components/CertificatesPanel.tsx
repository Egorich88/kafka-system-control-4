/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * @file CertificatesPanel.tsx
 * Таблица сертификатов Kafka.
 *
 * Backend уже возвращает найденные сертификаты. Если конкретный backend ещё
 * не отдаёт список, показываем небольшой явно обозначенный пример — это не
 * маскируется под реальные данные.
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiShield } from 'react-icons/fi';
import PanelInfo from '../../../components/common/PanelInfo';
import PanelFullscreenButton from './PanelFullscreenButton';
import { useCluster } from '../../../contexts/ClusterContext';

interface Certificate {
  name: string;
  path: string;
  expiresAt: string;
  daysLeft: number;
  type?: string;
}

interface ResponseData {
  count: number;
  nearestDays: number;
  certificates: Certificate[];
  available: boolean;
  message?: string;
}

const DEMO_CERTIFICATES: Certificate[] = [
  { name: 'kafka-broker.crt', path: '/etc/kafka/tls/', expiresAt: '2027-03-25', daysLeft: 184, type: 'X.509 / PEM' },
  { name: 'client.crt', path: '/etc/kafka/tls/', expiresAt: '2026-12-24', daysLeft: 92, type: 'X.509 / PEM' },
  { name: 'ca-chain.pem', path: '/etc/kafka/tls/', expiresAt: '2027-01-18', daysLeft: 117, type: 'X.509 Chain' },
  { name: 'kafka.keystore.jks', path: '/etc/kafka/secrets/', expiresAt: '2027-05-11', daysLeft: 231, type: 'JKS Keystore' },
  { name: 'kafka.truststore.jks', path: '/etc/kafka/secrets/', expiresAt: '2027-04-07', daysLeft: 197, type: 'JKS Truststore' },
  { name: 'client.p12', path: '/etc/kafka/secrets/', expiresAt: '2027-02-02', daysLeft: 133, type: 'PKCS#12' },
  { name: 'client.pfx', path: '/etc/kafka/secrets/', expiresAt: '2026-11-29', daysLeft: 67, type: 'PKCS#12' },
  { name: 'client-key.pem', path: '/etc/kafka/tls/', expiresAt: '2027-02-02', daysLeft: 133, type: 'PKCS#8 / PEM' },
];

export default function CertificatesPanel({ refreshKey }: { refreshKey: number }): JSX.Element {
  const { currentCluster } = useCluster();
  const [data, setData] = useState<ResponseData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!currentCluster) return;
      try {
        const bootstrap = currentCluster.brokers || currentCluster.bootstrapServers;
        const response = await axios.get<ResponseData>('/api/overview/certificates', {
          headers: { 'X-Kafka-Bootstrap': bootstrap },
        });
        if (!cancelled) setData(response.data);
      } catch (error) {
        if (!cancelled) setData(null);
        console.warn('Не удалось получить сертификаты Kafka:', error);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [currentCluster?.id, currentCluster?.brokers, currentCluster?.bootstrapServers, refreshKey]);

  const realCertificates = data?.certificates ?? [];
  const isDemo = realCertificates.length === 0;
  const certificates = isDemo ? DEMO_CERTIFICATES : realCertificates;
  const count = data?.count ?? (isDemo ? DEMO_CERTIFICATES.length : 0);
  const nearest = data?.nearestDays ?? (isDemo ? Math.min(...DEMO_CERTIFICATES.map((item) => item.daysLeft)) : 0);

  return (
    <div className="dashboard-panel certificate-panel">
      <div className="panel-header certificate-panel-header">
        <div className="panel-title-with-info">
          <PanelInfo
            title="Сертификаты Kafka"
            description="Список сертификатов и TLS-хранилищ Kafka с типом, сроком действия и оставшимся количеством дней. При отсутствии данных отображается явно обозначенный пример поддерживаемых форматов."
          />
          <FiShield className="certificate-title-icon" aria-hidden="true" />
          <span>Сертификаты Kafka</span>
        </div>
        <PanelFullscreenButton />
      </div>

      <div className="certificate-panel-body">
        <div className="certificate-summary">
          <div className="certificate-summary-main">
            <strong>{count}</strong>
            <span>сертификатов</span>
          </div>
          <div className="certificate-summary-nearest">
            Ближайшее истечение: <strong>{nearest ? `${nearest} дн.` : '—'}</strong>
          </div>
          {isDemo && <span className="certificate-demo-badge">Пример</span>}
        </div>

        <div className="certificate-table-wrap">
          <div className="certificate-table">
            <div className="certificate-table-row header">
              <span>Сертификат</span>
              <span>Тип</span>
              <span>Истекает</span>
              <span>Осталось</span>
            </div>

            {certificates.map((certificate) => (
              <div className="certificate-table-row" key={`${certificate.name}-${certificate.path}`}>
                <span title={certificate.name}>{certificate.name}</span>
                <span className="certificate-type" title={certificate.type || certificate.path}>{certificate.type || certificate.path}</span>
                <span className="certificate-expiry">{certificate.expiresAt || '—'}</span>
                <span className={`certificate-days ${certificate.daysLeft <= 30 ? 'certificate-warning' : 'certificate-ok'}`}>
                  {certificate.daysLeft} дн.
                </span>
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="certificate-empty">Сертификаты не обнаружены</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

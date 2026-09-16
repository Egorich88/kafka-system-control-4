/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * @file CertificatesPanel.tsx
 * Сводка срока действия сертификатов Kafka.
 *
 * Панель намеренно компактная: крупная цифра показывает количество
 * обнаруженных сертификатов, а наведение раскрывает детали.
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';
import PanelInfo from '../../../components/common/PanelInfo';
import PanelFullscreenButton from './PanelFullscreenButton';
import { useCluster } from '../../../contexts/ClusterContext';

interface Certificate { name: string; path: string; expiresAt: string; daysLeft: number; }
interface ResponseData { count: number; nearestDays: number; certificates: Certificate[]; available: boolean; message?: string; }

export default function CertificatesPanel({ refreshKey }: { refreshKey: number }): JSX.Element {
  const { currentCluster } = useCluster();
  const [data, setData] = useState<ResponseData | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentCluster) return;
      try {
        const bootstrap = currentCluster.brokers || currentCluster.bootstrapServers;
        const response = await axios.get<ResponseData>('/api/overview/certificates', { headers: { 'X-Kafka-Bootstrap': bootstrap } });
        setData(response.data);
      } catch (error) {
        console.error('Ошибка получения сертификатов:', error);
        setData(null);
      }
    };
    void load();
  }, [currentCluster, refreshKey]);

  const nearest = data?.nearestDays ?? 0;
  const warning = data?.available && nearest <= 30;

  return (
    <div className="dashboard-panel certificate-panel">
      <div className="panel-header certificate-panel-header">
        <div className="panel-title-with-info">
          <PanelInfo
            title="Сертификаты Kafka"
            description="Количество обнаруженных JKS/PKCS12 хранилищ и минимальный оставшийся срок действия сертификата. Наведите курсор на показатель для подробностей."
          />
          <span>Сертификаты Kafka</span>
        </div>
        <PanelFullscreenButton />
      </div>
      <div className="certificate-panel-body">
        <div className={`certificate-count ${warning ? 'is-warning' : ''}`} title={data?.certificates?.map((item) => `${item.name}: ${item.daysLeft} дн.`).join('\\n') || data?.message || 'Сертификаты не обнаружены'}>
          {warning && <FiAlertTriangle />}
          {!warning && <FiShield />}
          <strong>{data?.count ?? 0}</strong>
          <span>сертификатов</span>
        </div>
        <div className="certificate-description">
          <span>До ближайшего истечения</span>
          <strong>{data?.available ? `${nearest} дн.` : '—'}</strong>
        </div>
      </div>
    </div>
  );
}

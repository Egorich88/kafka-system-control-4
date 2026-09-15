/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * =============================================================================
 * PageHeader.tsx
 * =============================================================================
 *
 * Единая горизонтальная верхняя панель KSC.
 *
 * Слева:
 *   • название текущей страницы;
 *   • имя выбранного Kafka-кластера.
 *
 * Справа:
 *   • выбор периода;
 *   • выбор интервала автообновления;
 *   • ручное обновление.
 *
 * Панель размещается в Layout и поэтому одинакова для всех страниц.
 * =============================================================================
 */

import {
    useEffect,
    useRef,
    useState,
    type ReactNode
} from 'react';

import {
    FiChevronDown,
    FiClock,
    FiRefreshCw
} from 'react-icons/fi';

import { useLocation } from 'react-router-dom';

import { useCluster } from '../../contexts/ClusterContext';

import {
    REFRESH_OPTIONS,
    TIME_RANGE_OPTIONS,
    useDashboardControls,
    type RefreshOption,
    type TimeRangeOption
} from '../../contexts/DashboardControlsContext';

import '../../styles/page-header.css';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Обзор кластера',
    '/overview': 'Обзор кластера',
    '/brokers': 'Брокеры',
    '/topics': 'Управление топиками',
    '/groups': 'Группы потребителей',
    '/acls': 'ACL',
    '/search': 'Поиск сообщений',
    '/audit': 'Аудит',
    '/console': 'Консоль',
    '/alerts': 'Оповещения',
    '/user': 'Пользователь',
    '/settings': 'Настройки',
    '/connect': 'Kafka Connect',
    '/ksqldb': 'ksqlDB',
    '/schema-registry': 'Schema Registry'
};

interface SelectMenuProps<T> {
    icon: ReactNode;
    value: T;
    options: T[];
    label: string;
    getKey: (option: T) => string | number;
    getLabel: (option: T) => string;
    onSelect: (option: T) => void;
}

function SelectMenu<T>({
    icon,
    value,
    options,
    label,
    getKey,
    getLabel,
    onSelect
}: SelectMenuProps<T>) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            className={`ksc-page-control ${open ? 'is-open' : ''}`}
        >
            <button
                type="button"
                className="ksc-page-control-button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen(previous => !previous)}
            >
                <span className="ksc-page-control-icon">
                    {icon}
                </span>

                <span className="ksc-page-control-value">
                    {getLabel(value)}
                </span>

                <FiChevronDown className="ksc-page-control-chevron" />
            </button>

            {open && (
                <div className="ksc-page-control-menu">
                    {options.map(option => {
                        const key = getKey(option);
                        const selected =
                            getKey(value) === key;

                        return (
                            <button
                                key={String(key)}
                                type="button"
                                className={`ksc-page-control-option ${
                                    selected ? 'is-selected' : ''
                                }`}
                                onClick={() => {
                                    onSelect(option);
                                    setOpen(false);
                                }}
                            >
                                <span>{getLabel(option)}</span>

                                {selected && (
                                    <span className="ksc-page-control-check">
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function PageHeader() {
    const { pathname } = useLocation();
    const { currentCluster } = useCluster();

    const {
        timeRange,
        setTimeRange,
        refreshInterval,
        setRefreshInterval,
        requestRefresh
    } = useDashboardControls();

    const [refreshing, setRefreshing] =
        useState(false);

    const title =
        PAGE_TITLES[pathname] ??
        'Kafka System Control';

    const refreshOption =
        REFRESH_OPTIONS.find(
            option => option.value === refreshInterval
        ) ?? REFRESH_OPTIONS[1];

    const handleRefresh = () => {
        if (refreshing) {
            return;
        }

        setRefreshing(true);
        requestRefresh();

        window.setTimeout(() => {
            setRefreshing(false);
        }, 650);
    };

    return (
        <header className="ksc-page-header">
            <div className="ksc-page-header-title">
                <h1>{title}</h1>

                {currentCluster && (
                    <span className="ksc-page-header-cluster">
                        {currentCluster.name}
                    </span>
                )}
            </div>

            <div className="ksc-page-header-controls">
                <SelectMenu<TimeRangeOption>
                    icon={<FiClock />}
                    value={timeRange}
                    options={TIME_RANGE_OPTIONS}
                    label="Период"
                    getKey={option => option.id}
                    getLabel={option => option.label}
                    onSelect={setTimeRange}
                />

                <SelectMenu<RefreshOption>
                    icon={<FiRefreshCw />}
                    value={refreshOption}
                    options={REFRESH_OPTIONS}
                    label="Интервал обновления"
                    getKey={option => option.value}
                    getLabel={option => option.label}
                    onSelect={option =>
                        setRefreshInterval(option.value)
                    }
                />

                <button
                    type="button"
                    className={`ksc-page-refresh-button ${
                        refreshing ? 'is-refreshing' : ''
                    }`}
                    aria-label="Обновить"
                    title="Обновить"
                    onClick={handleRefresh}
                    disabled={!currentCluster || refreshing}
                >
                    <FiRefreshCw />
                </button>
            </div>
        </header>
    );
}

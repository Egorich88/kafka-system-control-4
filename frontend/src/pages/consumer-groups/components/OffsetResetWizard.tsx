/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * =============================================================================
 * OffsetResetWizard.tsx
 * =============================================================================
 *
 * Пункт 8: Боковая панель сброса оффсетов.
 *
 * • Overlay с blur (как CreateTopicModal)
 * • 3 шага: подготовка → метод → подтверждение
 * • Предупреждение об остановке consumer'ов перед сбросом
 * =============================================================================
 */

import { useState } from 'react';
import { FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { ConsumerGroup, OffsetResetMethod } from '../types/consumer-groups.types';
import '../styles/offset-reset-panel.css';

interface Props {
    group: ConsumerGroup | null;
    open: boolean;
    onClose: () => void;
}

const STEPS = ['Подготовка', 'Метод сброса', 'Подтверждение'];

export default function OffsetResetWizard({ group, open, onClose }: Props) {
    const [step, setStep] = useState(0);
    const [consumersStopped, setConsumersStopped] = useState(false);
    const [topicScope, setTopicScope] = useState<'all' | 'specific'>('all');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [partitionScope, setPartitionScope] = useState<'all' | 'specific'>('all');
    const [selectedPartition, setSelectedPartition] = useState('0');
    const [resetMethod, setResetMethod] = useState<OffsetResetMethod>('latest');
    const [datetimeValue, setDatetimeValue] = useState('');
    const [offsetValue, setOffsetValue] = useState('0');

    if (!open || !group) return null;

    const topics = group.topics ?? [];
    const partitions = group.partitions ?? 1;

    const reset = () => {
        setStep(0);
        setConsumersStopped(false);
        setTopicScope('all');
        setSelectedTopic(topics[0] ?? '');
        setPartitionScope('all');
        setSelectedPartition('0');
        setResetMethod('latest');
        setDatetimeValue('');
        setOffsetValue('0');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleConfirm = () => {
        toast.success(`Оффсеты группы «${group.name}» сброшены (${resetMethod})`);
        handleClose();
    };

    const canProceedStep0 = consumersStopped;
    const canProceedStep1 = resetMethod !== 'datetime' || datetimeValue !== '';

    return (
        <div className="offset-reset-overlay" onClick={handleClose}>
            <div
                className="offset-reset-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="offset-reset-header">
                    <div>
                        <h2>Сброс оффсетов</h2>
                        <p className="offset-reset-group-name">{group.name}</p>
                    </div>
                    <button type="button" className="offset-reset-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Шаги */}
                <div className="offset-reset-steps">
                    {STEPS.map((label, i) => (
                        <div
                            key={label}
                            className={`offset-reset-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                        >
                            <span className="step-num">
                                {i < step ? <FiCheck /> : i + 1}
                            </span>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="offset-reset-body">
                    {step === 0 && (
                        <>
                            <div className="offset-reset-warning">
                                <FiAlertTriangle />
                                <div>
                                    <strong>Важно!</strong> Перед сбросом оффсетов необходимо
                                    остановить все consumer-приложения группы «{group.name}».
                                    Иначе они могут перезаписать оффсеты после сброса.
                                </div>
                            </div>

                            <label className="offset-reset-checkbox">
                                <input
                                    type="checkbox"
                                    checked={consumersStopped}
                                    onChange={(e) => setConsumersStopped(e.target.checked)}
                                />
                                Я подтверждаю, что все consumer-приложения остановлены
                            </label>

                            <div className="offset-reset-section">
                                <div className="offset-reset-section-title">Выбор топика</div>
                                <label className="offset-reset-radio">
                                    <input
                                        type="radio"
                                        checked={topicScope === 'all'}
                                        onChange={() => setTopicScope('all')}
                                    />
                                    Все топики ({topics.length})
                                </label>
                                <label className="offset-reset-radio">
                                    <input
                                        type="radio"
                                        checked={topicScope === 'specific'}
                                        onChange={() => setTopicScope('specific')}
                                    />
                                    Конкретный топик
                                </label>
                                {topicScope === 'specific' && (
                                    <select
                                        className="offset-reset-select"
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                    >
                                        {topics.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="offset-reset-section">
                                <div className="offset-reset-section-title">Выбор партиции</div>
                                <label className="offset-reset-radio">
                                    <input
                                        type="radio"
                                        checked={partitionScope === 'all'}
                                        onChange={() => setPartitionScope('all')}
                                    />
                                    Все партиции ({partitions})
                                </label>
                                <label className="offset-reset-radio">
                                    <input
                                        type="radio"
                                        checked={partitionScope === 'specific'}
                                        onChange={() => setPartitionScope('specific')}
                                    />
                                    Конкретная партиция
                                </label>
                                {partitionScope === 'specific' && (
                                    <select
                                        className="offset-reset-select"
                                        value={selectedPartition}
                                        onChange={(e) => setSelectedPartition(e.target.value)}
                                    >
                                        {Array.from({ length: partitions }, (_, i) => (
                                            <option key={i} value={String(i)}>
                                                Партиция {i}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <div className="offset-reset-section">
                            <div className="offset-reset-section-title">Метод сброса оффсета</div>
                            {([
                                ['earliest', 'Earliest — начало топика'],
                                ['latest', 'Latest — конец топика'],
                                ['datetime', 'По дате/времени'],
                                ['offset', 'По конкретному offset'],
                                ['current', 'Текущее значение (без изменений)']
                            ] as [OffsetResetMethod, string][]).map(([value, label]) => (
                                <label key={value} className="offset-reset-radio">
                                    <input
                                        type="radio"
                                        checked={resetMethod === value}
                                        onChange={() => setResetMethod(value)}
                                    />
                                    {label}
                                </label>
                            ))}

                            {resetMethod === 'datetime' && (
                                <input
                                    type="datetime-local"
                                    className="offset-reset-input"
                                    value={datetimeValue}
                                    onChange={(e) => setDatetimeValue(e.target.value)}
                                />
                            )}

                            {resetMethod === 'offset' && (
                                <input
                                    type="number"
                                    className="offset-reset-input"
                                    placeholder="Offset"
                                    value={offsetValue}
                                    onChange={(e) => setOffsetValue(e.target.value)}
                                    min="0"
                                />
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="offset-reset-preview">
                            <div className="offset-reset-section-title">Предварительный просмотр</div>
                            <div className="preview-row">
                                <span>Группа</span>
                                <strong>{group.name}</strong>
                            </div>
                            <div className="preview-row">
                                <span>Топик</span>
                                <strong>
                                    {topicScope === 'all' ? 'Все' : selectedTopic}
                                </strong>
                            </div>
                            <div className="preview-row">
                                <span>Партиция</span>
                                <strong>
                                    {partitionScope === 'all' ? 'Все' : selectedPartition}
                                </strong>
                            </div>
                            <div className="preview-row">
                                <span>Метод</span>
                                <strong>{resetMethod}</strong>
                            </div>

                            <div className="offset-reset-warning">
                                <FiAlertTriangle />
                                <div>
                                    Эта операция необратимо изменит оффсеты для выбранной группы.
                                    Убедитесь, что consumer-приложения остановлены.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="offset-reset-footer">
                    <button type="button" className="offset-reset-btn cancel" onClick={handleClose}>
                        Отмена
                    </button>
                    {step > 0 && (
                        <button
                            type="button"
                            className="offset-reset-btn secondary"
                            onClick={() => setStep(step - 1)}
                        >
                            Назад
                        </button>
                    )}
                    {step < 2 ? (
                        <button
                            type="button"
                            className="offset-reset-btn primary"
                            disabled={
                                (step === 0 && !canProceedStep0) ||
                                (step === 1 && !canProceedStep1)
                            }
                            onClick={() => setStep(step + 1)}
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="offset-reset-btn primary"
                            onClick={handleConfirm}
                        >
                            Сбросить оффсеты
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

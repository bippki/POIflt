import React, { useState } from 'react';
import {
    Settings, X,
    Landmark, Trees, Utensils, Dumbbell, Ticket, Sparkles, Banknote,
    Undo2, MapPin, Navigation, Lock, Unlock, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RouteData } from '../types';
import { getCategoryConfig } from './Map/POIMarkers';

interface RouteMenuProps {
    onBuildRoute: (settings: { categories: string[], minSteps: number, maxSteps: number, isReturnBack: boolean }) => void;
    activeRoute: RouteData | null;
    onClearRoute: () => void;
    lockedPoiIds: Set<number>;
    onToggleLock: (id: number) => void;
    onRebuild: () => void;
    onSelectSegment: (index: number | null) => void;
}

export default function RouteMenu({
                                      onBuildRoute,
                                      activeRoute,
                                      onClearRoute,
                                      lockedPoiIds,
                                      onToggleLock,
                                      onRebuild,
                                      onSelectSegment
                                  }: RouteMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['culture', 'food_drink', 'natural_outdoor']);
    const [minSteps, setMinSteps] = useState(3000);
    const [maxSteps, setMaxSteps] = useState(8000);
    const [isReturnBack, setIsReturnBack] = useState(false);

    const categories = [
        { id: 'culture', icon: <Landmark size={18} />, label: 'Культура' },
        { id: 'natural_outdoor', icon: <Trees size={18} />, label: 'Природа' },
        { id: 'food_drink', icon: <Utensils size={18} />, label: 'Еда' },
        { id: 'sport', icon: <Dumbbell size={18} />, label: 'Спорт' },
        { id: 'entertaiment', icon: <Ticket size={18} />, label: 'Развлечения' },
        { id: 'beaty_wellness', icon: <Sparkles size={18} />, label: 'Красота' },
        { id: 'retail', icon: <Banknote size={18} />, label: 'Шоппинг' },
    ];

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleBuild = () => {
        onBuildRoute({
            categories: selectedCategories,
            minSteps,
            maxSteps,
            isReturnBack
        });
        setIsOpen(false);
    };

    return (
        <div className="route-menu-container" id="route-menu-wrapper">
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`trigger-button ${activeRoute ? 'has-route' : ''}`}
                id="route-settings-trigger"
                style={{
                    background: activeRoute ? 'var(--natural-sage)' : 'white',
                    color: activeRoute ? 'white' : 'var(--natural-ink)'
                }}
            >
                {isOpen ? <X size={20} /> : (activeRoute ? <Navigation size={20} /> : <Settings size={20} />)}
                <span>{activeRoute ? 'Ваш маршрут' : 'Параметры маршрута'}</span>
            </motion.button>

            {/* Menu Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="menu-card"
                        id="route-menu-card"
                    >
                        {activeRoute ? (
                            /* Route Details View */
                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <p className="section-title">Пеший маршрут</p>
                                        <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>По дорожкам и тротуарам</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={onRebuild}
                                            title="Пересоздать маршрут"
                                            style={{ padding: '4px', color: 'var(--natural-sage)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <RefreshCcw size={14} />
                                        </button>
                                        <button
                                            onClick={onClearRoute}
                                            style={{ fontSize: '11px', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Сбросить
                                        </button>
                                    </div>
                                </div>

                                <div className="poi-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div
                                        onClick={() => onSelectSegment(0)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '0',
                                            background: activeRoute.activeSegmentIndex === 0 ? '#f3f4f6' : 'transparent'
                                        }}
                                    >
                                        <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                                            <MapPin size={16} color={activeRoute.activeSegmentIndex === 0 ? 'var(--natural-sage)' : "#999"} />
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#666', fontWeight: activeRoute.activeSegmentIndex === 0 ? 600 : 400 }}>Точка старта</span>
                                    </div>

                                    {activeRoute.pois.map((poi, idx) => {
                                        const config = getCategoryConfig(poi.category);
                                        const CategoryIcon = config.icon;
                                        const isLocked = lockedPoiIds.has(poi.id);
                                        const segmentIndex = idx + 1;
                                        const isActive = activeRoute.activeSegmentIndex === segmentIndex;
                                        const legDistance = activeRoute.segmentDistances ? activeRoute.segmentDistances[idx] : null;

                                        return (
                                            <div
                                                key={poi.id}
                                                onClick={() => onSelectSegment(isActive ? null : segmentIndex)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '12px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    borderRadius: '0',
                                                    background: isActive ? '#f3f4f6' : 'transparent',
                                                    transition: 'background 0.2s'
                                                }}
                                            >                        {/* Connecting Line */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '11px',
                                                    top: '-16px',
                                                    bottom: '24px',
                                                    width: '2px',
                                                    background: '#eee',
                                                    zIndex: 0
                                                }} />

                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '0',
                                                    background: config.color,
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    zIndex: 1
                                                }}>
                                                    <CategoryIcon size={14} />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{poi.name}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '11px', color: '#999' }}>{poi.address.split(',').slice(1).join(',').trim()}</span>
                                                            {legDistance > 0 && (
                                                                <span style={{ fontSize: '10px', color: '#b71c1c', fontWeight: 600, background: '#fff0f0', padding: '1px 6px', borderRadius: '0' }}>
                                  {(legDistance / 1000).toFixed(1)} км
                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleLock(poi.id);
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: isLocked ? 'var(--natural-sage)' : '#d1bebe',
                                                            cursor: 'pointer',
                                                            padding: '4px'
                                                        }}
                                                    >
                                                        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {activeRoute.isReturnBack && (
                                        <div
                                            onClick={() => {
                                                const idx = activeRoute.points.length - 1;
                                                onSelectSegment(activeRoute.activeSegmentIndex === idx ? null : idx);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                padding: '6px',
                                                borderRadius: '0',
                                                background: activeRoute.activeSegmentIndex === activeRoute.points.length - 1 ? '#f3f4f6' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                left: '11px',
                                                top: '-16px',
                                                height: '16px',
                                                width: '2px',
                                                background: '#eee'
                                            }} />
                                            <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                                                <Undo2 size={16} color={activeRoute.activeSegmentIndex === activeRoute.points.length - 1 ? 'var(--natural-sage)' : "#999"} />
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#666', fontWeight: activeRoute.activeSegmentIndex === activeRoute.points.length - 1 ? 600 : 400 }}>Возврат к старту</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    padding: '12px',
                                    background: '#f9fafb',
                                    borderRadius: '0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>
                      {activeRoute.activeSegmentIndex != null ? 'Участок' : 'Всего'}
                    </span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                      {activeRoute.activeSegmentIndex != null && activeRoute.segmentDistances && activeRoute.activeSegmentIndex > 0
                          ? (activeRoute.segmentDistances[activeRoute.activeSegmentIndex - 1] > 0
                              ? (activeRoute.segmentDistances[activeRoute.activeSegmentIndex - 1] / 1000).toFixed(1) + ' км'
                              : 'Расчёт...')
                          : (activeRoute.totalDistance > 0
                              ? (activeRoute.totalDistance / 1000).toFixed(1) + ' км'
                              : 'Расчёт...')}
                    </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Шаги</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                      {activeRoute.activeSegmentIndex != null && activeRoute.segmentDistances && activeRoute.activeSegmentIndex > 0
                          ? (activeRoute.segmentDistances[activeRoute.activeSegmentIndex - 1] > 0
                              ? (activeRoute.segmentDistances[activeRoute.activeSegmentIndex - 1] / 0.7).toFixed(0)
                              : '...')
                          : (activeRoute.totalDistance > 0
                              ? (activeRoute.totalDistance / 0.7).toFixed(0)
                              : '...')}
                    </span>
                                    </div>
                                </div>
                            </section>
                        ) : (
                            /* Settings View with Category Selection */
                            <>
                                <section>
                                    <p className="section-title">Интересные места</p>
                                    <div className="categories-grid">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`category-item ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                                            >
                        <span className="category-icon">
                          {cat.icon}
                        </span>
                                                <span className="category-label">{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="divider">
                                    <div className="slider-header">
                                        <p className="section-title">Количество шагов</p>
                                        <span className="steps-badge">
                      {minSteps.toLocaleString()} — {maxSteps.toLocaleString()}
                    </span>
                                    </div>

                                    <div className="range" style={{
                                        '--value-1': minSteps,
                                        '--value-2': maxSteps
                                    } as React.CSSProperties}>
                                        <div className="track"></div>
                                        <div className="progress"></div>
                                        <div className="thumbs">
                                            <input
                                                className="range-input"
                                                type="range"
                                                min="1000"
                                                max="25000"
                                                step="500"
                                                value={minSteps}
                                                onChange={(e) => {
                                                    const val = Math.min(parseInt(e.target.value), maxSteps - 500);
                                                    setMinSteps(val);
                                                }}
                                            />
                                            <output
                                                className="range-output"
                                                style={{ '--value': `${((minSteps - 1000) / (25000 - 1000) * 100)}%` } as React.CSSProperties}
                                            >
                                                {minSteps}
                                            </output>
                                            <input
                                                className="range-input"
                                                type="range"
                                                min="1000"
                                                max="25000"
                                                step="500"
                                                value={maxSteps}
                                                onChange={(e) => {
                                                    const val = Math.max(parseInt(e.target.value), minSteps + 500);
                                                    setMaxSteps(val);
                                                }}
                                            />
                                            <output
                                                className="range-output"
                                                style={{ '--value': `${((maxSteps - 1000) / (25000 - 1000) * 100)}%` } as React.CSSProperties}
                                            >
                                                {maxSteps}
                                            </output>
                                        </div>
                                    </div>

                                    <div className="slider-labels" style={{ marginTop: '8px' }}>
                                        <span>1к</span>
                                        <span>12к</span>
                                        <span>25к</span>
                                    </div>

                                    {/* Toggle */}
                                    <div
                                        className="toggle-row"
                                        style={{ marginTop: '20px' }}
                                        onClick={() => setIsReturnBack(!isReturnBack)}
                                    >
                                        <div className="toggle-info">
                                            <div className={`toggle-icon ${isReturnBack ? 'active' : 'inactive'}`}>
                                                <Undo2 size={16} />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>Вернуться назад</span>
                                        </div>

                                        <div className={`toggle-bg ${isReturnBack ? 'active' : 'inactive'}`}>
                                            <div className="toggle-knob" />
                                        </div>
                                    </div>
                                </section>

                                <button
                                    className="submit-button"
                                    onClick={handleBuild}
                                >
                                    Построить маршрут
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

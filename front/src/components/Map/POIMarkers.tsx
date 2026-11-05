import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import {
    Radar,
    ChevronLeft,
    ChevronRight,
    Music,
    Utensils,
    Coffee,
    ShoppingBag,
    Trees,
    Bed,
    Gamepad2,
    Dumbbell,
    Building2,
    Store,
    Library,
    MapPin,
    Banknote,
    Sparkles
} from 'lucide-react';
import { POI } from '../../types';

interface POIMarkersProps {
    pois: POI[];
}

export const getCategoryConfig = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('culture') || cat.includes('art')) {
        return { icon: Library, color: '#e91e63' };
    }
    if (cat.includes('food') || cat.includes('restaura')) {
        return { icon: Utensils, color: '#f97316' };
    }
    if (cat.includes('cafe') || cat.includes('coffee')) {
        return { icon: Coffee, color: '#a16207' };
    }
    if (cat.includes('shop') || cat.includes('store') || cat.includes('mall')) {
        return { icon: ShoppingBag, color: '#3b82f6' };
    }
    if (cat.includes('park') || cat.includes('garden') || cat.includes('forest')) {
        return { icon: Trees, color: '#e53935' };
    }
    if (cat.includes('hotel') || cat.includes('hostel') || cat.includes('accomm')) {
        return { icon: Bed, color: '#a855f7' };
    }
    if (cat.includes('enterta') || cat.includes('cinema') || cat.includes('game')) {
        return { icon: Gamepad2, color: '#8b5cf6' };
    }
    if (cat.includes('sport') || cat.includes('gym') || cat.includes('fitness')) {
        return { icon: Dumbbell, color: '#06b6d4' };
    }
    if (cat.includes('educat') || cat.includes('school') || cat.includes('univers')) {
        return { icon: Building2, color: '#6366f1' };
    }
    if (cat.includes('retail')) {
        return { icon: Banknote, color: '#c62828' };
    }
    if (cat.includes('beauty') || cat.includes('wellness')) {
        return { icon: Sparkles, color: '#db2777' };
    }
    return { icon: MapPin, color: '#b71c1c' };
};

function POIPopupContent({ poi }: { poi: POI }) {
    const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
    const reviews = poi.reviews || [];
    const hasMultipleReviews = reviews.length > 1;

    const config = getCategoryConfig(poi.category);
    const CategoryIcon = config.icon;

    const nextReview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentReviewIdx((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    return (
        <div style={{ maxWidth: '240px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ padding: '6px', background: config.color, borderRadius: '8px', color: 'white' }}>
                    <CategoryIcon size={16} />
                </div>
                <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{poi.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '1px' }}>
                            {'★'.repeat(Math.round(poi.predicted_rating))}
                            <span style={{ color: '#e5e7eb' }}>{'★'.repeat(5 - Math.round(poi.predicted_rating))}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#666' }}>({poi.review_count})</span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{poi.address}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontSize: '10px', color: config.color, fontWeight: 'bold', textTransform: 'uppercase', background: `${config.color}15`, padding: '2px 6px', borderRadius: '4px' }}>
                    {poi.category}
                </div>
                <div style={{ fontSize: '10px', color: '#e53935', fontWeight: 'medium' }}>
                    Score: {(poi.score * 100).toFixed(1)}%
                </div>
            </div>

            {reviews.length > 0 && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#444', margin: 0 }}>Отзывы:</p>
                        {hasMultipleReviews && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#999' }}>{currentReviewIdx + 1}/{reviews.length}</span>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    <button
                                        onClick={prevReview}
                                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#999' }}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={nextReview}
                                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#999' }}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{
                        maxHeight: '100px',
                        overflowY: 'auto',
                        margin: '4px 0',
                        paddingRight: '4px'
                    }}>
                        <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#555', lineHeight: '1.4' }}>
                            "{reviews[currentReviewIdx]}"
                        </p>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '12px' }}>
                <button
                    style={{
                        width: '100%',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    Оставить отзыв
                </button>
            </div>
        </div>
    );
}

export default function POIMarkers({ pois }: POIMarkersProps) {
    return (
        <>
            {pois.map((poi) => (
                <Marker
                    key={`poi-${poi.id}`}
                    position={[poi.coordinates[1], poi.coordinates[0]]}
                >
                    <Popup>
                        <POIPopupContent poi={poi} />
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

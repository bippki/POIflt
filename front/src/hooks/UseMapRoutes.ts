import { useState, useCallback, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { UserMarker, POI, RouteData } from '../types';


function getDistance(pos1: [number, number], pos2: [number, number]) {
    const R = 6371e3;
    const φ1 = pos1[0] * Math.PI / 180;
    const φ2 = pos2[0] * Math.PI / 180;
    const Δφ = (pos2[0] - pos1[0]) * Math.PI / 180;
    const Δλ = (pos2[1] - pos1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function useMapRoutes() {
    const [markers, setMarkers] = useState<UserMarker[]>([]);
    const [pois, setPois] = useState<POI[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [radarCenter, setRadarCenter] = useState<[number, number]>([51.5335, 46.0342]);
    const [route, setRoute] = useState<RouteData | null>(null);
    const [lockedPoiIds, setLockedPoiIds] = useState<Set<number>>(new Set());
    const [lastRouteSettings, setLastRouteSettings] = useState<{ categories: string[], minSteps: number, maxSteps: number, isReturnBack: boolean } | null>(null);

    const fetchPOIs = useCallback(async (center: [number, number]) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/poi/nearby/recommended?lat=${center[0]}&lng=${center[1]}&limit=50`);
            if (response.ok) {
                const data = await response.json();
                setPois(data);
            } else {
                throw new Error('Response not ok');
            }
        } catch (error) {
            console.error('Failed to fetch POIs:', error);
            // Fallback mocked data
            setPois([
                {
                    id: 999,
                    name: "Тестовая точка",
                    address: "Улица Тестовая, 1",
                    coordinates: [center[1] + 0.005, center[0] + 0.005],
                    category: "culture",
                    score: 0.95,
                    predicted_rating: 5,
                    model_confidence: 0.8,
                    review_count: 1
                },
                {
                    id: 998,
                    name: "Парк Отдыха",
                    address: "Улица Зеленая, 10",
                    coordinates: [center[1] - 0.005, center[0] + 0.005],
                    category: "natural_outdoor",
                    score: 0.92,
                    predicted_rating: 4,
                    model_confidence: 0.85,
                    review_count: 20
                },
                {
                    id: 997,
                    name: "Кафе Уют",
                    address: "Проспект Мира, 5",
                    coordinates: [center[1] + 0.005, center[0] - 0.005],
                    category: "food_drink",
                    score: 0.88,
                    predicted_rating: 4.5,
                    model_confidence: 0.9,
                    review_count: 50
                }
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsScanning(false), 3000);
        }
    }, []);

    const handleBuildRoute = useCallback(async (settings: { categories: string[], minSteps: number, maxSteps: number, isReturnBack: boolean }) => {
        if (pois.length === 0) return;
        setLastRouteSettings(settings);

        // Filter POIs by categories
        const filteredPois = pois.filter(p => {
            return settings.categories.some(cat => p.category.toLowerCase().includes(cat.toLowerCase()));
        });

        if (filteredPois.length < 2 && lockedPoiIds.size === 0) {
            alert("Недостаточно точек для построения маршрута. Попробуйте выбрать больше категорий.");
            return;
        }

        setIsLoading(true);

        try {
            const lockedPois = route ? route.pois.filter(p => lockedPoiIds.has(p.id)) : [];
            const selectedPois: POI[] = [...lockedPois];

            const currentUnlockedIds = route ? route.pois.filter(p => !lockedPoiIds.has(p.id)).map(p => p.id) : [];

            const categoryCounts = new Map<string, number>();
            selectedPois.forEach(p => {
                const cat = p.category.toLowerCase();
                categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
            });

            const sorted = [...filteredPois]
                .filter(p => !selectedPois.find(sp => sp.id === p.id) && !currentUnlockedIds.includes(p.id))
                .sort((a, b) => b.score - a.score);

            const avgSteps = (settings.minSteps + settings.maxSteps) / 2;
            const targetMeters = avgSteps * 0.7;
            const targetPoiCount = Math.max(2, Math.min(8, Math.round(targetMeters / 600)));

            for (const poi of sorted) {
                if (selectedPois.length >= targetPoiCount) break;

                const cat = poi.category.toLowerCase();
                const currentCount = categoryCounts.get(cat) || 0;

                if (cat.includes('food_drink') && currentCount >= 2) continue;

                if (currentCount === 0) {
                    selectedPois.push(poi);
                    categoryCounts.set(cat, 1);
                }
            }

            if (selectedPois.length < targetPoiCount) {
                for (const poi of sorted) {
                    if (selectedPois.length >= targetPoiCount) break;
                    if (selectedPois.find(p => p.id === poi.id)) continue;

                    const cat = poi.category.toLowerCase();
                    const currentCount = categoryCounts.get(cat) || 0;

                    if (cat.includes('food_drink') && currentCount >= 2) continue;

                    selectedPois.push(poi);
                    categoryCounts.set(cat, currentCount + 1);
                }
            }

            if (selectedPois.length < 2) {
                const fallbackPool = filteredPois.filter(p => !selectedPois.find(sp => sp.id === p.id));
                for (const poi of fallbackPool) {
                    if (selectedPois.length >= targetPoiCount) break;
                    selectedPois.push(poi);
                }
            }

            const startPoint: [number, number] = markers.length > 0 ? markers[markers.length - 1].position : radarCenter;

            const remaining = [...selectedPois];
            const orderedPois: POI[] = [];
            const waypointChain: [number, number][] = [startPoint];
            let currentPos = startPoint;

            while (remaining.length > 0) {
                let closestIdx = 0;
                let minD = Infinity;
                remaining.forEach((p, idx) => {
                    const d = getDistance(currentPos, [p.coordinates[1], p.coordinates[0]]);
                    if (d < minD) {
                        minD = d;
                        closestIdx = idx;
                    }
                });
                const nextPoi = remaining.splice(closestIdx, 1)[0];
                orderedPois.push(nextPoi);
                const nextCoords: [number, number] = [nextPoi.coordinates[1], nextPoi.coordinates[0]];
                waypointChain.push(nextCoords);
                currentPos = nextCoords;
            }

            if (settings.isReturnBack) {
                waypointChain.push(startPoint);
            }

            setRoute({
                points: waypointChain,
                segments: [],
                pois: orderedPois,
                totalDistance: 0,
                isReturnBack: settings.isReturnBack,
                activeSegmentIndex: null,
                segmentDistances: new Array(orderedPois.length + (settings.isReturnBack ? 1 : 0)).fill(0)
            });

        } catch (error) {
            console.error('Routing error:', error);
            alert("Не удалось построить маршрут по дорогам.");
        } finally {
            setIsLoading(false);
        }
    }, [pois, lockedPoiIds, route, markers, radarCenter]);

    useEffect(() => {
        if (isScanning) {
            fetchPOIs(radarCenter);
        }
    }, [isScanning, radarCenter, fetchPOIs]);

    const handleAddMarker = useCallback((position: [number, number]) => {
        const newMarker: UserMarker = {
            id: Math.random().toString(36).substring(7),
            position,
            title: 'Стартовая точка'
        };
        setMarkers([newMarker]);
        setRadarCenter(position);
    }, []);

    const handleMarkerMove = useCallback((id: string, newPos: [number, number]) => {
        setMarkers(prev => prev.map(m =>
            m.id === id ? { ...m, position: newPos } : m
        ));
        setRadarCenter(newPos);
    }, []);

    const handleMarkerDelete = useCallback((id: string) => {
        setMarkers(prev => prev.filter(m => m.id !== id));
    }, []);

    const handleSelectSegment = useCallback((index: number | null) => {
        setRoute(prev => prev ? { ...prev, activeSegmentIndex: index } : null);
    }, []);

    const handleToggleLock = useCallback((id: number) => {
        setLockedPoiIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleClearRoute = useCallback(() => {
        setRoute(null);
        setLockedPoiIds(new Set());
    }, []);

    const handleRebuild = useCallback(() => {
        if (lastRouteSettings) {
            handleBuildRoute(lastRouteSettings);
        }
    }, [lastRouteSettings, handleBuildRoute]);

    const toggleRadar = useCallback(() => {
        if (isScanning) return;
        setIsScanning(true);
        if (markers.length > 0) {
            setRadarCenter(markers[markers.length - 1].position);
        }
    }, [isScanning, markers]);

    const waypoints = useMemo(() => {
        if (!route) return [];
        if (route.activeSegmentIndex != null && route.activeSegmentIndex > 0) {
            const from = route.points[route.activeSegmentIndex - 1];
            const to = route.points[route.activeSegmentIndex];
            return [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])];
        }
        return route.points.map(p => L.latLng(p[0], p[1]));
    }, [route]);

    return {
        markers,
        pois,
        isScanning,
        isLoading,
        radarCenter,
        route,
        lockedPoiIds,
        waypoints,
        setRoute,
        handleBuildRoute,
        handleAddMarker,
        handleMarkerMove,
        handleMarkerDelete,
        handleSelectSegment,
        handleToggleLock,
        handleClearRoute,
        handleRebuild,
        toggleRadar
    };
}

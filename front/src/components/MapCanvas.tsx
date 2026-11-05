import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import RouteMenu from './RouteMenu';
import RadarOverlay from './Map/RadarOverlay';
import MapController from './Map/MapController';
import MapEventsHandler from './Map/MapEventsHandler';
import UserMarkers from './Map/UserMarkers';
import POIMarkers from './Map/POIMarkers';
import MapControls from './Map/MapControls';
import RoutingControl from './RoutingControl';
import { useMapRoutes } from '../hooks/useMapRoutes';

// Fix for default marker icons using CDN
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapCanvas() {
    const {
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
    } = useMapRoutes();

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', 'marker');
        e.dataTransfer.dropEffect = 'move';
    };

    return (
        <div id="map-root">
            <MapContainer
                center={[51.5335, 46.0342]}
                zoom={13}
                zoomControl={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEventsHandler onMarkerAdd={handleAddMarker} />

                <MapController
                    active={isScanning}
                    center={radarCenter}
                    radius={500}
                />

                <UserMarkers
                    markers={route ? markers.filter(m => m.position[0] === route.points[0][0] && m.position[1] === route.points[0][1]) : markers}
                    onMarkerDelete={handleMarkerDelete}
                    onMarkerMove={handleMarkerMove}
                />

                <POIMarkers pois={route ? route.pois : pois} />

                {route && (
                    <RoutingControl
                        waypoints={waypoints}
                        onRouteFound={(distance) => {
                            setRoute(prev => {
                                if (!prev) return null;

                                // If we are looking at a specific segment, update its distance
                                if (prev.activeSegmentIndex != null && prev.activeSegmentIndex > 0) {
                                    const newSegmentDistances = [...(prev.segmentDistances || [])];
                                    newSegmentDistances[prev.activeSegmentIndex - 1] = distance;

                                    if (JSON.stringify(prev.segmentDistances) !== JSON.stringify(newSegmentDistances)) {
                                        return { ...prev, segmentDistances: newSegmentDistances };
                                    }
                                    return prev;
                                }

                                // If we are looking at the full route, update total distance
                                if (prev.totalDistance !== distance) {
                                    return { ...prev, totalDistance: distance };
                                }
                                return prev;
                            });
                        }}
                    />
                )}
            </MapContainer>

            <RouteMenu
                onBuildRoute={handleBuildRoute}
                activeRoute={route}
                onClearRoute={handleClearRoute}
                lockedPoiIds={lockedPoiIds}
                onToggleLock={handleToggleLock}
                onRebuild={handleRebuild}
                onSelectSegment={handleSelectSegment}
            />

            <RadarOverlay active={isScanning} radius={300} />

            <MapControls
                isLoading={isLoading}
                isScanning={isScanning}
                onToggleRadar={toggleRadar}
                onDragStart={handleDragStart}
            />
        </div>
    );
}

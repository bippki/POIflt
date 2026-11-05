import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { UserMarker } from '../../types';

import L from 'leaflet';

const RedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface UserMarkersProps {
    markers: UserMarker[];
    onMarkerDelete: (id: string) => void;
    onMarkerMove: (id: string, newPos: [number, number]) => void;
}

export default function UserMarkers({ markers, onMarkerDelete, onMarkerMove }: UserMarkersProps) {
    return (
        <>
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    draggable={true}
                    icon={RedIcon}
                    eventHandlers={{
                        dragend: (e) => {
                            const newLatlng = e.target.getLatLng();
                            onMarkerMove(marker.id, [newLatlng.lat, newLatlng.lng]);
                        }
                    }}
                >
                    <Popup>
                        <div style={{ padding: '4px' }}>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>{marker.title}</strong>
                            <button
                                onClick={() => onMarkerDelete(marker.id)}
                                style={{
                                    background: '#ff4d4d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                }}
                            >
                                Удалить
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

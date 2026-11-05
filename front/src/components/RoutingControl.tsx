import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface RoutingControlProps {
    waypoints: L.LatLng[];
    onRouteFound?: (distance: number, coordinates: [number, number][], legDistances?: number[]) => void;
}

const RoutingControl = ({ waypoints, onRouteFound }: RoutingControlProps) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        if (routingControlRef.current) {
            const currentWaypoints = routingControlRef.current.getWaypoints().map(w => w.latLng);
            const isSame = currentWaypoints.length === waypoints.length &&
                currentWaypoints.every((w, i) => w.lat === waypoints[i].lat && w.lng === waypoints[i].lng);

            if (!isSame) {
                routingControlRef.current.setWaypoints(waypoints);
            }
            return;
        }

        try {
            const routingControl = L.Routing.control({
                waypoints,
                routeWhileDragging: false,
                addWaypoints: false,
                fitSelectedRoutes: false, // Turn off auto-fit to avoid conflicts
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        { color: '#ef4444', opacity: 0.6, weight: 6, dashArray: '10, 10' },
                        { color: '#ef4444', opacity: 1, weight: 2 }
                    ],
                    extendToWaypoints: true,
                    missingRouteTolerance: 10
                },
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'foot'
                }),
                // @ts-ignore
                createMarker: () => null,
            }).addTo(map);

            routingControlRef.current = routingControl;

            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }

            routingControl.on('routesfound', (e) => {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const mainRoute = routes[0];
                    const summary = mainRoute.summary;
                    const coordinates = mainRoute.coordinates.map((c: L.LatLng) => [c.lat, c.lng] as [number, number]);
                    const legDistances = mainRoute.instructions ?
                        [] : [];
                    if (waypoints.length > 0) {
                        const bounds = L.latLngBounds(coordinates);
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }

                    if (onRouteFound) {
                        onRouteFound(summary.totalDistance, coordinates, legDistances);
                    }
                }
            });
        } catch (err) {
            console.error('Routing initialization error:', err);
        }
        return () => {
            if (routingControlRef.current) {
                const ctrl = routingControlRef.current;
                routingControlRef.current = null;
                setTimeout(() => {
                    try {
                        map.removeControl(ctrl);
                    } catch (err) {
                    }
                }, 0);
            }
        };
    }, [map, waypoints, onRouteFound]);

    return null;
};

export default RoutingControl;

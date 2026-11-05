import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { RouteData } from '../../types';
import L from 'leaflet';

interface MapControllerProps {
  active: boolean;
  center: [number, number];
  radius: number;
  route: RouteData | null;
}

export default function MapController({ active, center, radius, route }: MapControllerProps) {
  const map = useMap();
  const lastRouteId = useRef<string | null>(null);

  useEffect(() => {
    if (active && center) {
      // Smoothly fly to normalized center
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [active, center, map]);

  useEffect(() => {
    if (route && route.points.length > 0) {
      // Generate a simple ID to detect if it's a NEW route
      const routeId = JSON.stringify(route.pois.map(p => p.id));

      if (routeId !== lastRouteId.current) {
        lastRouteId.current = routeId;

        // Fit bounds smoothly
        const bounds = L.latLngBounds(route.points.map(p => [p[0], p[1]]));
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          easeLinearity: 0.1
        });
      }

      // If a segment is selected, zoom into it
      if (route.activeSegmentIndex != null) {
        const from = route.points[route.activeSegmentIndex - 1] || route.points[0];
        const to = route.points[route.activeSegmentIndex];
        const segBounds = L.latLngBounds([[from[0], from[1]], [to[0], to[1]]]);
        map.flyToBounds(segBounds, {
          padding: [80, 80],
          duration: 1.2
        });
      }
    }
  }, [route, map]);

  return null;
}

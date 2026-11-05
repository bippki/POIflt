import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapEventsHandlerProps {
  onMarkerAdd: (pos: [number, number]) => void;
}

export default function MapEventsHandler({ onMarkerAdd }: MapEventsHandlerProps) {
  const map = useMap();
  
  useEffect(() => {
    const container = map.getContainer();
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const latlng = map.mouseEventToLatLng(e);
      onMarkerAdd([latlng.lat, latlng.lng]);
    };
    
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [map, onMarkerAdd]);

  return null;
}

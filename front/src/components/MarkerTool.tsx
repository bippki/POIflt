import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface MarkerToolProps {
    onDragStart: (e: React.DragEvent) => void;
}

export default function MarkerTool({ onDragStart }: MarkerToolProps) {
    return (
        <div className="marker-tool-container" id="marker-tool-sidebar">
            <div style={{ position: 'relative' }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    draggable="true"
                    onDragStart={onDragStart}
                    className="marker-button"
                    id="marker-drag-source"
                >
                    <MapPin size={18} />
                </motion.div>
                <span className="marker-tooltip">Перетащите на карту</span>
            </div>
        </div>
    );
}

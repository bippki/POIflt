import React from 'react';
import { motion } from 'motion/react';
import { Radar } from 'lucide-react';
import MarkerTool from '../MarkerTool';

interface MapControlsProps {
    isLoading: boolean;
    isScanning: boolean;
    onToggleRadar: () => void;
    onDragStart: (e: React.DragEvent) => void;
}

export default function MapControls({ isLoading, isScanning, onToggleRadar, onDragStart }: MapControlsProps) {
    return (
        <div className="marker-tool-container" id="tools-sidebar">
            <MarkerTool onDragStart={onDragStart} />

            {/* Radar Toggle Button */}
            <div style={{ position: 'relative' }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggleRadar}
                    disabled={isLoading}
                    className={`radar-button ${isScanning || isLoading ? 'active' : ''}`}
                    id="radar-trigger"
                >
                    {isLoading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Radar size={24} />
                        </motion.div>
                    ) : (
                        <Radar size={24} />
                    )}
                </motion.button>
                <span className="marker-tooltip">Радар (поиск POI)</span>
            </div>
        </div>
    );
}

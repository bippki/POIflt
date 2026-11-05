import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RadarOverlayProps {
    active: boolean;
    radius: number;
}

export default function RadarOverlay({ active, radius }: RadarOverlayProps) {
    if (!active) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <AnimatePresence>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ width: 0, height: 0, opacity: 0.6 }}
                        animate={{
                            width: radius * 2,
                            height: radius * 2,
                            opacity: 0
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeOut"
                        }}
                        style={{
                            position: 'absolute',
                            border: '2px solid var(--natural-sage)',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(229, 57, 53, 0.2) 0%, rgba(229, 57, 53, 0) 70%)'
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

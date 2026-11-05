import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Poi } from './poi.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poi_id: number;

    @Column({ type: 'numeric', nullable: true })
    rating?: number; // Может быть null

    @Column({ nullable: true })
    text?: string; // Может быть null

    @ManyToOne(() => Poi, (poi) => poi.reviews)
    @JoinColumn({ name: 'poi_id' })
    poi: Poi;
}
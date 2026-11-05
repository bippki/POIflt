import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class Poi {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    address!: string;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
    geom!: string;

    @Column()
    category!: string;

    @OneToMany(() => Review, (review) => review.poi)
    reviews!: Review[];
}
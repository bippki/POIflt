import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Poi } from '../entity/poi.entity';
import { AxiosError } from 'axios';

@Injectable()
export class PoiService {
    private readonly logger = new Logger(PoiService.name);

    constructor(
        @InjectRepository(Poi)
        private readonly poiRepo: Repository<Poi>,
        private readonly httpService: HttpService,
    ) { }

    async findNearbyRaw(lat: number, lng: number) {
        return await this.poiRepo
            .createQueryBuilder('poi')
            .leftJoinAndSelect('poi.reviews', 'reviews')
            .where(
                `ST_DWithin(poi.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 1000)`,
                { lat, lng },
            )
            .getMany();
    }

    async getRecommendedNearby(lat: number, lng: number, limit: number) {
        const pois = await this.findNearbyRaw(lat, lng);
        if (pois.length === 0) return [];

        try {
            const { data } = await firstValueFrom(
                this.httpService.post('http://localhost:8000/recommend', {
                    pois: pois,
                    top_k: limit,
                    preferred_rubrics: [],
                }),
            );
            return data;
        } catch (error: unknown) {
            const errorMessage = error instanceof AxiosError
                ? error.response?.data?.message || error.message
                : 'Unknown error';

            this.logger.error(`AI Service failure: ${errorMessage}`);

            throw new HttpException(
                {
                    status: HttpStatus.SERVICE_UNAVAILABLE,
                    error: 'AI Recommendation Service is currently unavailable',
                    details: errorMessage,
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}
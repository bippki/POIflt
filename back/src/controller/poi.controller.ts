import { Controller, Get, Query } from '@nestjs/common';
import { PoiService } from '../service/poi.service';

@Controller('poi')
export class PoiController {
    constructor(private readonly poiService: PoiService) { }

    @Get('nearby')
    async findNearby(
        @Query('lat') lat: number,
        @Query('lng') lng: number,
    ) {
        return await this.poiService.findNearbyRaw(lat, lng);
    }

    @Get('nearby/recommended')
    async findRecommended(
        @Query('lat') lat: number,
        @Query('lng') lng: number,
        @Query('limit') limit: number = 5,
    ) {
        return await this.poiService.getRecommendedNearby(lat, lng, limit);
    }
}
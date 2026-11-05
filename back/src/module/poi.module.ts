import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiController } from '../controller/poi.controller';
import { Poi } from '../entity/poi.entity';
import { Review } from '../entity/review.entity';
import { HttpModule } from '@nestjs/axios';
import { PoiService } from '../service/poi.service';


@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature
            ([Poi, Review])],
    controllers: [PoiController],
    providers: [PoiService],
})
export class PoiModule { }
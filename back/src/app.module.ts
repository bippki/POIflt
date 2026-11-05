import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poi } from './entity/poi.entity';
import { Review } from './entity/review.entity';
import { PoiModule } from './module/poi.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '5262',
      database: 'postgres',
      entities: [Poi, Review],
      synchronize: false,
    }),
    PoiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

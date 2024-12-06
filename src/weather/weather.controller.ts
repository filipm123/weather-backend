import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('daily')
  @ApiQuery({ name: 'latitude', type: Number, required: true })
  @ApiQuery({ name: 'longitude', type: Number, required: true })
  async getDailyWeather(@Query('latitude') latitude: number, @Query('longitude') longitude: number) {
    return this.weatherService.getDailyWeather(latitude, longitude);
  }

  @Get('weekly-summary')
  @ApiQuery({ name: 'latitude', type: Number, required: true })
  @ApiQuery({ name: 'longitude', type: Number, required: true })
  async getWeeklySummary(@Query('latitude') latitude: number, @Query('longitude') longitude: number) {
    return this.weatherService.getWeeklySummary(latitude, longitude);
  }
}

import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly openMeteoUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly photovoltaicPower = 2.5; // in kW
  private readonly panelEfficiency = 0.2; // 20%

  /**
   * Validates user inputs for latitude and longitude
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    if (
      latitude < -90 || 
      latitude > 90 || 
      longitude < -180 || 
      longitude > 180
    ) {
      throw new BadRequestException('Invalid latitude or longitude values.');
    }
  }

  async getDailyWeather(latitude: number, longitude: number) {
    this.validateCoordinates(latitude, longitude);

    try {
      const response = await axios.get(this.openMeteoUrl, {
        params: {
          latitude,
          longitude,
          daily: 'weathercode,temperature_2m_min,temperature_2m_max,sunshine_duration',
          timezone: 'auto',
        },
      });

      const data = response.data?.daily;
      if (!data || !data.time || !data.weathercode) {
        throw new InternalServerErrorException('Incomplete or invalid data received from Open-Meteo API.');
      }

      const results = data.time.map((date: string, index: number) => {
        const exposureTime = data.sunshine_duration[index] / 60; // convert to hours
        const generatedEnergy = this.photovoltaicPower * exposureTime * this.panelEfficiency;

        return {
          date,
          weatherCode: data.weathercode[index],
          minTemp: data.temperature_2m_min[index],
          maxTemp: data.temperature_2m_max[index],
          generatedEnergy: generatedEnergy.toFixed(2), // kWh
        };
      });

      return results;
    } catch (error) {
      if (error.response) {
        throw new InternalServerErrorException(`Open-Meteo API Error: ${error.response.statusText}`);
      }
      throw new InternalServerErrorException('Unable to fetch weather data.');
    }
  }

  async getWeeklySummary(latitude: number, longitude: number) {
    this.validateCoordinates(latitude, longitude);

    try {
      const response = await axios.get(this.openMeteoUrl, {
        params: {
          latitude,
          longitude,
          daily: 'weathercode,temperature_2m_min,temperature_2m_max,sunshine_duration',
          timezone: 'auto',
        },
      });

      const data = response.data?.daily;
      if (!data || !data.time || !data.weathercode) {
        throw new InternalServerErrorException('Incomplete or invalid data received from Open-Meteo API.');
      }

      const exposureTimes = data.sunshine_duration.map((duration: number) => duration / 60); // convert to hours
      const minTemps = data.temperature_2m_min;
      const maxTemps = data.temperature_2m_max;


      const averageSunExposure = exposureTimes.reduce((a, b) => a + b, 0) / exposureTimes.length;
      const minTemp = Math.min(...minTemps);
      const maxTemp = Math.max(...maxTemps);
      const rainyDays = data.weathercode.filter((code: number) => code >= 61 && code <= 80).length;


      return {
        averageSunExposure: averageSunExposure.toFixed(2),
        extremeTemps: { min: minTemp, max: maxTemp },
        summary: rainyDays > 3 ? 'Week with rainfall' : 'Week without rainfall',
      };
    } catch (error) {
      if (error.response) {
        throw new InternalServerErrorException(`Open-Meteo API Error: ${error.response.statusText}`);
      }
      throw new InternalServerErrorException('Unable to fetch weather data.');
    }
  }
}

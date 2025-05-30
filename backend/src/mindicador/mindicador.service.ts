import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MindicadorService {
  private readonly apiUrl = 'https://mindicador.cl/api';

  constructor(private readonly httpService : HttpService) {}

  async getDolarValue(): Promise<{ fecha: string, valor: number}> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.apiUrl));
      const data = response.data;
      const dolar = data.dolar;
      const fecha = dolar.fecha.split('T')[0];      
      // const fecha = new Date().toISOString().split('T')[0];      

      return {
        fecha,
        valor: dolar.valor
      }
    } catch (error) {
      console.error('Error al consultar la API ', error);
      throw new HttpException("No se pudo obtener el valor de dolar", 500)
    }
  }
}

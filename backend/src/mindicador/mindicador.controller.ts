import { Controller, Get } from '@nestjs/common';
import { MindicadorService } from './mindicador.service';

@Controller('indicadores')
export class MindicadorController {
  constructor(private readonly mindicadorService: MindicadorService) {}

  @Get('dolar')
  async getDolar(): Promise<{ fecha: string; valor: number }> {
    return await this.mindicadorService.getDolarValue();
  }
}

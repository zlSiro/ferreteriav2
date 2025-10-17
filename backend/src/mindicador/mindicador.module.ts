import { Module } from '@nestjs/common';
import { MindicadorService } from './mindicador.service';
import { MindicadorController } from './mindicador.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [MindicadorController],
  providers: [MindicadorService],
})
export class MindicadorModule {}

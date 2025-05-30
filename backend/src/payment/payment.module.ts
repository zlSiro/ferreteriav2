import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';  // Necesario para ConfigService

@Module({
  imports: [ConfigModule],  // Permite usar ConfigService en PaymentService
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],  // Opcional: Si otros módulos necesitan usar PaymentService
})
export class PaymentModule {}
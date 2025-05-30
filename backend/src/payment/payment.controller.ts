import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';

@Controller('payment')  // Ruta base: /payments
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Endpoint para crear una transacción
  @Post('create')
  async createPayment(
    @Body('amount') amount: number,
    @Body('buyOrder') buyOrder: string,
    @Body('sessionId') sessionId: string,
    @Body('returnUrl') returnUrl: string,
  ) {
    try {
      const transaction = await this.paymentService.createTransaction(
        amount,
        buyOrder,
        sessionId,
        returnUrl,
      );
      return { url: transaction.url, token: transaction.token };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Endpoint para confirmar una transacción
  @Get('confirm')
  async confirmPayment(@Query('token_ws') token: string) {  // Transbank envía el token como 'token_ws'
    try {
      const result = await this.paymentService.commitTransaction(token);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
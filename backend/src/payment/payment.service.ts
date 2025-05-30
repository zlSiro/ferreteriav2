import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Options, WebpayPlus, IntegrationCommerceCodes, Environment, IntegrationApiKeys } from 'transbank-sdk';

@Injectable()
export class PaymentService {
  private tx: InstanceType<typeof WebpayPlus.Transaction>; // Corrección clave

  constructor(private configService: ConfigService) {
    // Configuración desde variables de entorno (.env)
    const commerceCode = this.configService.get<string>('TRANSBANK_COMMERCE_CODE') || IntegrationCommerceCodes.WEBPAY_PLUS;
    const apiKey = this.configService.get<string>('TRANSBANK_API_KEY') || IntegrationApiKeys.WEBPAY;
    const environment = this.configService.get<string>('TRANSBANK_ENV') === 'prod' ? Environment.Production : Environment.Integration;

    this.tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, environment));
  }

  // Crear una transacción Webpay Plus
  async createTransaction(amount: number, buyOrder: string, sessionId: string, returnUrl: string) {
    try {
      const response = await this.tx.create(buyOrder, sessionId, amount, returnUrl);
      return response;
    } catch (error) {
      throw new Error(`Error al crear transacción: ${error.message}`);
    }
  }

  // Confirmar una transacción (cuando TransBank redirige al usuario de vuelta)
  async commitTransaction(token: string) {
    try {
      const response = await this.tx.commit(token);
      return response;
    } catch (error) {
      throw new Error(`Error al confirmar transacción: ${error.message}`);
    }
  }
}
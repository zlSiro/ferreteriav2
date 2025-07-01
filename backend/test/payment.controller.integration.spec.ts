import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../src/payment/payment.controller';
import { PaymentService } from '../src/payment/payment.service';
import { ConfigService } from '@nestjs/config';

describe('PaymentController Integration Tests', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  const mockPaymentService = {
    createTransaction: jest.fn(),
    commitTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment successfully (OK)', async () => {
      // Arrange
      const amount = 15000;
      const buyOrder = 'ORDER_987654321';
      const sessionId = 'SESSION_987654321';
      const returnUrl = 'http://localhost:3000/payment/confirm';

      const mockTransactionResponse = {
        token: 'mock_token_payment_123',
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
      };

      mockPaymentService.createTransaction.mockResolvedValue(mockTransactionResponse);

      // Act
      const result = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(result).toEqual({
        url: mockTransactionResponse.url,
        token: mockTransactionResponse.token,
      });
      expect(mockPaymentService.createTransaction).toHaveBeenCalledWith(
        amount,
        buyOrder,
        sessionId,
        returnUrl,
      );
      expect(mockPaymentService.createTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle error in createPayment (NOT OK)', async () => {
      // Arrange
      const amount = 15000;
      const buyOrder = 'ORDER_987654321';
      const sessionId = 'SESSION_987654321';
      const returnUrl = 'http://localhost:3000/payment/confirm';

      const mockError = new Error('Service unavailable');
      mockPaymentService.createTransaction.mockRejectedValue(mockError);

      // Act
      const result = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(result).toEqual({
        error: 'Service unavailable',
      });
      expect(mockPaymentService.createTransaction).toHaveBeenCalledWith(
        amount,
        buyOrder,
        sessionId,
        returnUrl,
      );
      expect(mockPaymentService.createTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle createPayment with minimal data (OK NO DATA)', async () => {
      // Arrange
      const amount = 0;
      const buyOrder = '';
      const sessionId = '';
      const returnUrl = '';

      const mockTransactionResponse = {
        token: null,
        url: null,
      };

      mockPaymentService.createTransaction.mockResolvedValue(mockTransactionResponse);

      // Act
      const result = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(result).toEqual({
        url: null,
        token: null,
      });
      expect(mockPaymentService.createTransaction).toHaveBeenCalledWith(
        amount,
        buyOrder,
        sessionId,
        returnUrl,
      );
      expect(mockPaymentService.createTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully (OK)', async () => {
      // Arrange
      const token = 'valid_confirmation_token_123';

      const mockCommitResponse = {
        vci: 'TSY',
        amount: 15000,
        status: 'AUTHORIZED',
        buy_order: 'ORDER_987654321',
        session_id: 'SESSION_987654321',
        card_detail: {
          card_number: '1234',
        },
        accounting_date: '0522',
        transaction_date: new Date('2024-05-22T10:30:00Z').toISOString(),
        authorization_code: '5678',
        payment_type_code: 'VD',
        response_code: 0,
        installments_number: 0,
      };

      mockPaymentService.commitTransaction.mockResolvedValue(mockCommitResponse);

      // Act
      const result = await controller.confirmPayment(token);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockCommitResponse,
      });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('AUTHORIZED');
      expect(result.data.amount).toBe(15000);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledWith(token);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle error in confirmPayment (NOT OK)', async () => {
      // Arrange
      const token = 'invalid_or_expired_token';

      const mockError = new Error('Token validation failed');
      mockPaymentService.commitTransaction.mockRejectedValue(mockError);

      // Act
      const result = await controller.confirmPayment(token);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Token validation failed',
      });
      expect(result.success).toBe(false);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledWith(token);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle confirmPayment with empty token (OK NO DATA)', async () => {
      // Arrange
      const token = '';

      const mockCommitResponse = {
        vci: null,
        amount: 0,
        status: 'FAILED',
        buy_order: '',
        session_id: '',
        card_detail: null,
        accounting_date: null,
        transaction_date: null,
        authorization_code: null,
        payment_type_code: null,
        response_code: -1,
        installments_number: 0,
      };

      mockPaymentService.commitTransaction.mockResolvedValue(mockCommitResponse);

      // Act
      const result = await controller.confirmPayment(token);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockCommitResponse,
      });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('FAILED');
      expect(result.data.amount).toBe(0);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledWith(token);
      expect(mockPaymentService.commitTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate complete payment flow (OK)', async () => {
      // Arrange - Crear transacción
      const amount = 25000;
      const buyOrder = 'ORDER_COMPLETE_FLOW';
      const sessionId = 'SESSION_COMPLETE_FLOW';
      const returnUrl = 'http://localhost:3000/payment/confirm';

      const mockCreateResponse = {
        token: 'flow_token_123',
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
      };

      const mockConfirmResponse = {
        vci: 'TSY',
        amount: 25000,
        status: 'AUTHORIZED',
        buy_order: 'ORDER_COMPLETE_FLOW',
        session_id: 'SESSION_COMPLETE_FLOW',
        card_detail: {
          card_number: '9999',
        },
        accounting_date: '0522',
        transaction_date: new Date().toISOString(),
        authorization_code: '9999',
        payment_type_code: 'VN',
        response_code: 0,
        installments_number: 0,
      };

      mockPaymentService.createTransaction.mockResolvedValue(mockCreateResponse);
      mockPaymentService.commitTransaction.mockResolvedValue(mockConfirmResponse);

      // Act - Crear pago
      const createResult = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert - Verificar creación
      expect(createResult.url).toBeDefined();
      expect(createResult.token).toBeDefined();

      // Act - Confirmar pago
      const confirmResult = await controller.confirmPayment(createResult.token);

      // Assert - Verificar confirmación
      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data.status).toBe('AUTHORIZED');
      expect(confirmResult.data.amount).toBe(amount);
      expect(confirmResult.data.buy_order).toBe(buyOrder);
    });

    it('should handle failed payment flow (NOT OK)', async () => {
      // Arrange
      const amount = 1000;
      const buyOrder = 'ORDER_FAILED_FLOW';
      const sessionId = 'SESSION_FAILED_FLOW';
      const returnUrl = 'http://localhost:3000/payment/confirm';

      // Simular error en la creación
      const createError = new Error('Insufficient funds');
      mockPaymentService.createTransaction.mockRejectedValue(createError);

      // Act
      const createResult = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(createResult.error).toBe('Insufficient funds');
      expect(createResult.url).toBeUndefined();
      expect(createResult.token).toBeUndefined();
    });

    it('should handle payment flow with no data (OK NO DATA)', async () => {
      // Arrange
      const amount = 0;
      const buyOrder = '';
      const sessionId = '';
      const returnUrl = '';

      const mockCreateResponse = {
        token: '',
        url: '',
      };

      mockPaymentService.createTransaction.mockResolvedValue(mockCreateResponse);

      // Act
      const createResult = await controller.createPayment(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(createResult.url).toBe('');
      expect(createResult.token).toBe('');
      expect(mockPaymentService.createTransaction).toHaveBeenCalledWith(
        0,
        '',
        '',
        '',
      );
    });
  });
});

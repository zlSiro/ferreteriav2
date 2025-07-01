import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from 'transbank-sdk';

// Mock de transbank-sdk
jest.mock('transbank-sdk', () => {
  const mockTransaction = {
    create: jest.fn(),
    commit: jest.fn(),
  };

  return {
    WebpayPlus: {
      Transaction: jest.fn().mockImplementation(() => mockTransaction),
    },
    Options: jest.fn(),
    IntegrationCommerceCodes: {
      WEBPAY_PLUS: '597055555532',
    },
    IntegrationApiKeys: {
      WEBPAY: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
    },
    Environment: {
      Integration: 'integration',
      Production: 'production',
    },
  };
});

describe('PaymentService Integration Tests', () => {
  let service: PaymentService;
  let configService: ConfigService;
  let mockTransaction: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'TRANSBANK_COMMERCE_CODE':
                  return '597055555532';
                case 'TRANSBANK_API_KEY':
                  return '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
                case 'TRANSBANK_ENV':
                  return 'integration';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Obtener la instancia mockeada de la transacción
    mockTransaction = (service as any).tx;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully (OK)', async () => {
      // Arrange
      const amount = 10000;
      const buyOrder = 'ORDER_123456789';
      const sessionId = 'SESSION_123456789';
      const returnUrl = 'http://localhost:3000/payment/confirm';
      
      const mockResponse = {
        token: 'mock_token_123',
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
      };

      mockTransaction.create.mockResolvedValue(mockResponse);

      // Act
      const result = await service.createTransaction(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockTransaction.create).toHaveBeenCalledWith(buyOrder, sessionId, amount, returnUrl);
      expect(mockTransaction.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when createTransaction fails (NOT OK)', async () => {
      // Arrange
      const amount = 10000;
      const buyOrder = 'ORDER_123456789';
      const sessionId = 'SESSION_123456789';
      const returnUrl = 'http://localhost:3000/payment/confirm';
      
      const mockError = new Error('TransBank API Error: Invalid parameters');
      mockTransaction.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.createTransaction(amount, buyOrder, sessionId, returnUrl))
        .rejects
        .toThrow('Error al crear transacción: TransBank API Error: Invalid parameters');
      
      expect(mockTransaction.create).toHaveBeenCalledWith(buyOrder, sessionId, amount, returnUrl);
      expect(mockTransaction.create).toHaveBeenCalledTimes(1);
    });

    it('should handle empty/null data in createTransaction (OK NO DATA)', async () => {
      // Arrange
      const amount = 0;
      const buyOrder = '';
      const sessionId = '';
      const returnUrl = '';
      
      const mockResponse = {
        token: null,
        url: null,
      };

      mockTransaction.create.mockResolvedValue(mockResponse);

      // Act
      const result = await service.createTransaction(amount, buyOrder, sessionId, returnUrl);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.token).toBeNull();
      expect(result.url).toBeNull();
      expect(mockTransaction.create).toHaveBeenCalledWith(buyOrder, sessionId, amount, returnUrl);
      expect(mockTransaction.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('commitTransaction', () => {
    it('should commit a transaction successfully (OK)', async () => {
      // Arrange
      const token = 'valid_token_123456789';
      
      const mockResponse = {
        vci: 'TSY',
        amount: 10000,
        status: 'AUTHORIZED',
        buy_order: 'ORDER_123456789',
        session_id: 'SESSION_123456789',
        card_detail: {
          card_number: '6623',
        },
        accounting_date: '0522',
        transaction_date: new Date().toISOString(),
        authorization_code: '1213',
        payment_type_code: 'VN',
        response_code: 0,
        installments_number: 0,
      };

      mockTransaction.commit.mockResolvedValue(mockResponse);

      // Act
      const result = await service.commitTransaction(token);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('AUTHORIZED');
      expect(result.amount).toBe(10000);
      expect(mockTransaction.commit).toHaveBeenCalledWith(token);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    });

    it('should throw error when commitTransaction fails (NOT OK)', async () => {
      // Arrange
      const token = 'invalid_token_123';
      
      const mockError = new Error('TransBank API Error: Token not found or expired');
      mockTransaction.commit.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.commitTransaction(token))
        .rejects
        .toThrow('Error al confirmar transacción: TransBank API Error: Token not found or expired');
      
      expect(mockTransaction.commit).toHaveBeenCalledWith(token);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token in commitTransaction (OK NO DATA)', async () => {
      // Arrange
      const token = '';
      
      const mockResponse = {
        vci: null,
        amount: null,
        status: 'FAILED',
        buy_order: null,
        session_id: null,
        card_detail: null,
        accounting_date: null,
        transaction_date: null,
        authorization_code: null,
        payment_type_code: null,
        response_code: -1,
        installments_number: null,
      };

      mockTransaction.commit.mockResolvedValue(mockResponse);

      // Act
      const result = await service.commitTransaction(token);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('FAILED');
      expect(result.amount).toBeNull();
      expect(result.buy_order).toBeNull();
      expect(mockTransaction.commit).toHaveBeenCalledWith(token);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Configuration', () => {
    it('should initialize with correct TransBank configuration', () => {
      // Act & Assert
      expect(configService.get).toHaveBeenCalledWith('TRANSBANK_COMMERCE_CODE');
      expect(configService.get).toHaveBeenCalledWith('TRANSBANK_API_KEY');
      expect(configService.get).toHaveBeenCalledWith('TRANSBANK_ENV');
    });

    it('should use default values when environment variables are not set', async () => {
      // Arrange
      const moduleWithDefaults: TestingModule = await Test.createTestingModule({
        providers: [
          PaymentService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => null), // Simula que no hay variables de entorno
            },
          },
        ],
      }).compile();

      const serviceWithDefaults = moduleWithDefaults.get<PaymentService>(PaymentService);
      const configServiceWithDefaults = moduleWithDefaults.get<ConfigService>(ConfigService);

      // Act & Assert
      expect(configServiceWithDefaults.get).toHaveBeenCalledWith('TRANSBANK_COMMERCE_CODE');
      expect(configServiceWithDefaults.get).toHaveBeenCalledWith('TRANSBANK_API_KEY');
      expect(configServiceWithDefaults.get).toHaveBeenCalledWith('TRANSBANK_ENV');
    });
  });
});

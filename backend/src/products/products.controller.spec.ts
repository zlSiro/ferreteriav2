import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BadRequestException } from '@nestjs/common';
import { UploadImageService } from '../upload-image/upload-image.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;
  let uploadImageService: UploadImageService;

  // Mocks
  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUploadImageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: UploadImageService, useValue: mockUploadImageService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
    uploadImageService = module.get<UploadImageService>(UploadImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = {
        name: 'Test Product',
        price: 100,
        inventory: 10,
        image: 'test.jpg',
        categoryId: 1,
      };
      const expectedResult = { ...createProductDto, id: 1 };

      mockProductsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createProductDto);

      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {    it('should return all products with default pagination', async () => {
      const mockProducts = {
        products: [{ id: 1, name: 'Product 1' }],
        total: 1,
      };
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const query = { take: 10, skip: 0 } as any;
      const result = await controller.findAll(query);

      expect(productsService.findAll).toHaveBeenCalledWith(null, 10, 0);
      expect(result).toEqual(mockProducts);
    });

    it('should return products with specific pagination and category filter', async () => {
      const mockProducts = {
        products: [{ id: 1, name: 'Product 1', category: { id: 2 } }],
        total: 1,
      };
      const query = { category_id: 2, take: 20, skip: 10 };
      
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll(query);

      expect(productsService.findAll).toHaveBeenCalledWith(2, 20, 10);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const productId = '1';
      const expectedProduct = { id: 1, name: 'Product 1' };
      
      mockProductsService.findOne.mockResolvedValue(expectedProduct);

      const result = await controller.findOne(productId);

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '1';
      const updateProductDto = { name: 'Updated Product' };
      const expectedResult = { id: 1, ...updateProductDto };
      
      mockProductsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateProductDto);

      expect(productsService.update).toHaveBeenCalledWith(1, updateProductDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const productId = '1';
      const expectedResult = { message: 'Producto Eliminado' };
      
      mockProductsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(productId);

      expect(productsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});

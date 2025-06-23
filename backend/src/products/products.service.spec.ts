import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

// Mock para Repository<Product>
const mockProductRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

// Mock para Repository<Category>
const mockCategoryRepository = () => ({
  findOneBy: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const categoryId = 1;
      const createProductDto = {
        name: 'Test Product',
        price: 100,
        inventory: 10,
        image: 'test.jpg',
        categoryId,
      };

      const category = { id: categoryId, name: 'Test Category' };
      const expectedProduct = { ...createProductDto, category };

      jest.spyOn(categoryRepository, 'findOneBy').mockResolvedValue(category as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(expectedProduct as any);

      const result = await service.create(createProductDto);

      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
      expect(productRepository.save).toHaveBeenCalledWith({
        ...createProductDto,
        category,
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      const categoryId = 999;
      const createProductDto = {
        name: 'Test Product',
        price: 100,
        inventory: 10,
        image: 'test.jpg',
        categoryId,
      };

      jest.spyOn(categoryRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.create(createProductDto)).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
    });
  });

  describe('findAll', () => {
    it('should return products and total count without category filter', async () => {
      const products = [
        { id: 1, name: 'Product 1', category: { id: 1, name: 'Category 1' } },
        { id: 2, name: 'Product 2', category: { id: 2, name: 'Category 2' } },
      ];
      const total = 2;

      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products as any, total]);

      const result = await service.findAll(null, 10, 0);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        relations: { category: true },
        order: { id: 'DESC' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual({ products, total });
    });

    it('should return products and total count with category filter', async () => {
      const categoryId = 1;
      const products = [
        { id: 1, name: 'Product 1', category: { id: categoryId, name: 'Category 1' } },
      ];
      const total = 1;

      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products as any, total]);

      const result = await service.findAll(categoryId, 10, 0);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        relations: { category: true },
        order: { id: 'DESC' },
        take: 10,
        skip: 0,
        where: {
          category: {
            id: categoryId,
          },
        },
      });
      expect(result).toEqual({ products, total });
    });
  });

  describe('findOne', () => {
    it('should return a product if it exists', async () => {
      const productId = 1;
      const expectedProduct = {
        id: productId,
        name: 'Test Product',
        category: { id: 1, name: 'Category 1' },
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(expectedProduct as any);

      const result = await service.findOne(productId);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: { category: true },
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const productId = 999;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: { category: true },
      });
    });
  });

  describe('update', () => {
    it('should update a product successfully without changing category', async () => {
      const productId = 1;
      const existingProduct = {
        id: productId,
        name: 'Existing Product',
        price: 100,
        inventory: 10,
        image: 'existing.jpg',
        category: { id: 1, name: 'Category 1' },
      };
      
      const updateProductDto = {
        name: 'Updated Product',
        price: 150,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct as any);

      const result = await service.update(productId, updateProductDto);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(productRepository.save).toHaveBeenCalledWith({
        ...existingProduct,
        ...updateProductDto,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should update a product with a new category', async () => {
      const productId = 1;
      const newCategoryId = 2;
      
      const existingProduct = {
        id: productId,
        name: 'Existing Product',
        price: 100,
        inventory: 10,
        image: 'existing.jpg',
        category: { id: 1, name: 'Category 1' },
      };
      
      const updateProductDto = {
        name: 'Updated Product',
        categoryId: newCategoryId,
      };

      const newCategory = { id: newCategoryId, name: 'New Category' };
      
      const updatedProduct = {
        ...existingProduct,
        name: updateProductDto.name,
        category: newCategory,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      jest.spyOn(categoryRepository, 'findOneBy').mockResolvedValue(newCategory as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct as any);

      const result = await service.update(productId, updateProductDto);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: newCategoryId });
      expect(productRepository.save).toHaveBeenCalledWith({
        ...existingProduct,
        name: updateProductDto.name,
        category: newCategory,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when updating with non-existent category', async () => {
      const productId = 1;
      const nonExistentCategoryId = 999;
      
      const existingProduct = {
        id: productId,
        name: 'Existing Product',
        category: { id: 1, name: 'Category 1' },
      };
      
      const updateProductDto = {
        name: 'Updated Product',
        categoryId: nonExistentCategoryId,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      jest.spyOn(categoryRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: nonExistentCategoryId });
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const productId = 1;
      const existingProduct = {
        id: productId,
        name: 'Product to Remove',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      jest.spyOn(productRepository, 'remove').mockResolvedValue({} as any);

      const result = await service.remove(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(productRepository.remove).toHaveBeenCalledWith(existingProduct);
      expect(result).toEqual({ message: 'Producto Eliminado' });
    });
  });
});

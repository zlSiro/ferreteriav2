import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';

// Mock para Repository<Category>
const mockCategoryRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto = { name: 'Test Category' };
      const expectedResult = { id: 1, ...createCategoryDto };

      jest.spyOn(categoryRepository, 'save').mockResolvedValue(expectedResult as any);

      const result = await service.create(createCategoryDto);

      expect(categoryRepository.save).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const expectedCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      jest.spyOn(categoryRepository, 'find').mockResolvedValue(expectedCategories as any);

      const result = await service.findAll();

      expect(categoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category without products', async () => {
      const categoryId = 1;
      const expectedCategory = { id: categoryId, name: 'Test Category' };

      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(expectedCategory as any);

      const result = await service.findOne(categoryId);

      const expectedOptions: FindManyOptions<Category> = {
        where: { id: categoryId },
      };
      expect(categoryRepository.findOne).toHaveBeenCalledWith(expectedOptions);
      expect(result).toEqual(expectedCategory);
    });

    it('should return a category with products when products=true', async () => {
      const categoryId = 1;
      const expectedCategory = {
        id: categoryId,
        name: 'Test Category',
        products: [{ id: 1, name: 'Product 1' }],
      };

      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(expectedCategory as any);

      const result = await service.findOne(categoryId, 'true');

      const expectedOptions: FindManyOptions<Category> = {
        where: { id: categoryId },
        relations: { products: true },
        order: { products: { id: 'DESC' } },
      };
      expect(categoryRepository.findOne).toHaveBeenCalledWith(expectedOptions);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      const categoryId = 999;

      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(categoryId)).rejects.toThrow(NotFoundException);
      
      const expectedOptions: FindManyOptions<Category> = {
        where: { id: categoryId },
      };
      expect(categoryRepository.findOne).toHaveBeenCalledWith(expectedOptions);
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 1;
      const updateCategoryDto = { name: 'Updated Category' };
      
      const existingCategory = { id: categoryId, name: 'Old Category' };
      const updatedCategory = { ...existingCategory, ...updateCategoryDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory as any);
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(updatedCategory as any);

      const result = await service.update(categoryId, updateCategoryDto);

      expect(service.findOne).toHaveBeenCalledWith(categoryId);
      expect(categoryRepository.save).toHaveBeenCalledWith({
        ...existingCategory,
        ...updateCategoryDto,
      });
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const categoryId = 1;
      const existingCategory = { id: categoryId, name: 'Category to Remove' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory as any);
      jest.spyOn(categoryRepository, 'remove').mockResolvedValue({} as any);

      const result = await service.remove(categoryId);

      expect(service.findOne).toHaveBeenCalledWith(categoryId);
      expect(categoryRepository.remove).toHaveBeenCalledWith(existingCategory);
      expect(result).toEqual("Categoria elminada.");
    });
  });
});

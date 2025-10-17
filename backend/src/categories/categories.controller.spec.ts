import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // Mock para CategoriesService
  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto = { name: 'Test Category' };
      const expectedResult = { id: 1, ...createCategoryDto };

      mockCategoriesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const expectedCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      mockCategoriesService.findAll.mockResolvedValue(expectedCategories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category without products', async () => {
      const categoryId = '1';
      const expectedCategory = { id: 1, name: 'Test Category' };

      mockCategoriesService.findOne.mockResolvedValue(expectedCategory);

      const result = await controller.findOne(categoryId);

      expect(service.findOne).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(expectedCategory);
    });

    it('should return a category with products when products=true', async () => {
      const categoryId = '1';
      const productsParam = 'true';
      const expectedCategory = {
        id: 1,
        name: 'Test Category',
        products: [{ id: 1, name: 'Product 1' }],
      };

      mockCategoriesService.findOne.mockResolvedValue(expectedCategory);

      const result = await controller.findOne(categoryId, productsParam);

      expect(service.findOne).toHaveBeenCalledWith(1, productsParam);
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = '1';
      const updateCategoryDto = { name: 'Updated Category' };
      const expectedResult = { id: 1, ...updateCategoryDto };

      mockCategoriesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(categoryId, updateCategoryDto);

      expect(service.update).toHaveBeenCalledWith(1, updateCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = '1';
      const expectedResult = 'Categoria elminada.';

      mockCategoriesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(categoryId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});

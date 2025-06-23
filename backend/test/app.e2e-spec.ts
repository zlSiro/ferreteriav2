import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { Product } from '../src/products/entities/product.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockCategoryRepository;
  let mockProductRepository;

  beforeEach(async () => {
    mockCategoryRepository = {
      find: jest.fn().mockResolvedValue([
        { id: 1, name: 'Test Category' },
      ]),
      findOne: jest.fn().mockImplementation((options) => {
        if (options.where && options.where.id === 1) {
          return Promise.resolve({ id: 1, name: 'Test Category' });
        }
        return Promise.resolve(null);
      }),
      save: jest.fn().mockImplementation((category) => {
        return Promise.resolve({ id: 1, ...category });
      }),
    };

    mockProductRepository = {
      findAndCount: jest.fn().mockResolvedValue([
        [{ id: 1, name: 'Test Product', category: { id: 1, name: 'Test Category' } }],
        1,
      ]),
      findOne: jest.fn().mockImplementation((options) => {
        if (options.where && options.where.id === 1) {
          return Promise.resolve({ 
            id: 1, 
            name: 'Test Product', 
            price: 100, 
            inventory: 10, 
            image: 'test.jpg',
            category: { id: 1, name: 'Test Category' } 
          });
        }
        return Promise.resolve(null);
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Category))
      .useValue(mockCategoryRepository)
      .overrideProvider(getRepositoryToken(Product))
      .useValue(mockProductRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/categories (GET)', () => {
    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(1);
          expect(res.body[0].id).toBe(1);
          expect(res.body[0].name).toBe('Test Category');
        });
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should return a specific category', () => {
      return request(app.getHttpServer())
        .get('/categories/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.name).toBe('Test Category');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/categories/999')
        .expect(404);
    });
  });

  describe('/products (GET)', () => {
    it('should return products with pagination', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('products');
          expect(res.body).toHaveProperty('total');
          expect(res.body.products).toBeInstanceOf(Array);
          expect(res.body.products.length).toBe(1);
          expect(res.body.products[0].id).toBe(1);
          expect(res.body.products[0].name).toBe('Test Product');
          expect(res.body.total).toBe(1);
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a specific product', () => {
      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.name).toBe('Test Product');
          expect(res.body.category).toBeDefined();
          expect(res.body.category.id).toBe(1);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/999')
        .expect(404);
    });
  });
});

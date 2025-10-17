/**
 * Tests del Store del Carrito de Compras (Zustand)
 * Estos tests se ejecutan directamente con Node.js sin necesidad de un navegador
 */

import { useStore } from '../src/store';
import { Product } from '../src/schemas';

// Mock básico de fetch para las pruebas de cupones
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper para crear una instancia limpia del store
const createFreshStore = () => {
  const store = useStore.getState();
  store.clearCart();
  return store;
};

describe('Shopping Cart Store Tests', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Taladro Eléctrico',
    image: 'taladro.jpg',
    price: 50000,
    inventory: 10,
    categoryId: 1,
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Martillo',
    image: 'martillo.jpg',
    price: 25000,
    inventory: 5,
    categoryId: 1,
  };

  const mockProductLowStock: Product = {
    id: 3,
    name: 'Destornillador',
    image: 'destornillador.jpg',
    price: 15000,
    inventory: 2,
    categoryId: 1,
  };

  beforeEach(() => {
    // Limpiar el store antes de cada test de manera más agresiva
    const store = useStore.getState();
    store.clearCart();
    
    // Resetear manualmente el estado del cupón si queda residual
    const state = useStore.getState();
    if (state.coupon.name || state.coupon.percentage || state.discount) {
      // Forzar reset completo del estado
      useStore.setState({
        total: 0,
        discount: 0,
        contents: [],
        coupon: {
          percentage: 0,
          name: "",
          message: "",
        }
      });
    }
    
    mockFetch.mockClear();
  });

  describe('addToCart', () => {
    test('should add a new product to cart successfully (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(1);
      expect(state.contents[0]).toMatchObject({
        productId: 1,
        name: 'Taladro Eléctrico',
        price: 50000,
        quantity: 1,
        inventory: 10,
      });
      expect(state.total).toBe(50000);
    });

    test('should increase quantity when adding existing product (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct);
      store.addToCart(mockProduct);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(1);
      expect(state.contents[0].quantity).toBe(2);
      expect(state.total).toBe(100000);
    });

    test('should not exceed inventory limit when adding product (NOT OK)', () => {
      const store = useStore.getState();

      // Agregar hasta el límite de inventario
      store.addToCart(mockProductLowStock);
      store.addToCart(mockProductLowStock);
      // Intentar agregar más allá del inventario (debería fallar)
      store.addToCart(mockProductLowStock);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(1);
      expect(state.contents[0].quantity).toBe(2); // No debería pasar de 2
      expect(state.total).toBe(30000);
    });

    test('should handle multiple different products (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct);
      store.addToCart(mockProduct2);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(2);
      expect(state.total).toBe(75000); // 50000 + 25000
    });

    test('should handle product with zero inventory (OK NO DATA)', () => {
      const store = useStore.getState();
      const zeroInventoryProduct: Product = {
        ...mockProduct,
        inventory: 0,
      };

      store.addToCart(zeroInventoryProduct);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(1);
      expect(state.contents[0].quantity).toBe(1);
      // Aunque el inventario sea 0, se permite agregar 1 item inicialmente
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      const store = useStore.getState();
      store.addToCart(mockProduct);
    });

    test('should update product quantity successfully (OK)', () => {
      const store = useStore.getState();

      store.updateQuantity(1, 5);

      const state = useStore.getState();
      expect(state.contents[0].quantity).toBe(5);
      expect(state.total).toBe(250000);
    });

    test('should update quantity to zero (OK NO DATA)', () => {
      const store = useStore.getState();

      store.updateQuantity(1, 0);

      const state = useStore.getState();
      expect(state.contents[0].quantity).toBe(0);
      expect(state.total).toBe(0);
    });

    test('should handle non-existent product update (NOT OK)', () => {
      const store = useStore.getState();
      const originalState = useStore.getState();
      const originalContents = [...originalState.contents];

      store.updateQuantity(999, 5); // ID que no existe

      const newState = useStore.getState();
      // No debería cambiar nada
      expect(newState.contents).toEqual(originalContents);
      expect(newState.total).toBe(50000); // Total original
    });

    test('should update multiple products independently (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct2);
      store.updateQuantity(1, 3); // Taladro
      store.updateQuantity(2, 2); // Martillo

      const state = useStore.getState();
      expect(state.contents).toHaveLength(2);
      expect(state.contents.find(item => item.productId === 1)?.quantity).toBe(3);
      expect(state.contents.find(item => item.productId === 2)?.quantity).toBe(2);
      expect(state.total).toBe(200000); // (50000*3) + (25000*2)
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      const store = useStore.getState();
      store.addToCart(mockProduct);
      store.addToCart(mockProduct2);
    });

    test('should remove product from cart successfully (OK)', () => {
      const store = useStore.getState();

      store.removeFromCart(1);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(1);
      expect(state.contents[0].productId).toBe(2);
      expect(state.total).toBe(25000);
    });

    test('should clear cart when removing last item (OK)', () => {
      const store = useStore.getState();

      store.removeFromCart(1);
      store.removeFromCart(2);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.discount).toBe(0);
      expect(state.coupon.name).toBe('');
    });

    test('should handle non-existent product removal (NOT OK)', () => {
      const store = useStore.getState();
      const originalLength = useStore.getState().contents.length;

      store.removeFromCart(999); // ID que no existe

      const state = useStore.getState();
      expect(state.contents).toHaveLength(originalLength);
      expect(state.total).toBe(75000); // Total original
    });

    test('should handle empty cart removal (OK NO DATA)', () => {
      const store = useStore.getState();

      store.clearCart();
      store.removeFromCart(1);

      const state = useStore.getState();
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    test('should calculate total correctly with multiple items (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct); // 50000
      store.addToCart(mockProduct2); // 25000
      store.updateQuantity(1, 2); // 50000 * 2 = 100000

      const state = useStore.getState();
      expect(state.total).toBe(125000); // 100000 + 25000
    });

    test('should calculate total as zero for empty cart (OK NO DATA)', () => {
      const store = useStore.getState();

      store.calculateTotal();

      const state = useStore.getState();
      expect(state.total).toBe(0);
    });

    test('should handle decimal prices correctly (OK)', () => {
      const store = useStore.getState();
      const decimalProduct: Product = {
        ...mockProduct,
        price: 10.99,
      };

      store.addToCart(decimalProduct);
      store.updateQuantity(1, 3);

      const state = useStore.getState();
      expect(state.total).toBeCloseTo(32.97);
    });
  });

  describe('applyCoupon', () => {
    beforeEach(() => {
      const store = useStore.getState();
      store.addToCart(mockProduct); // 50000
    });

    test('should apply coupon successfully (OK)', async () => {
      const store = useStore.getState();
      
      const mockCouponResponse = {
        name: 'DISCOUNT10',
        message: 'Descuento aplicado correctamente',
        percentage: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCouponResponse,
      });

      await store.applyCoupon('DISCOUNT10');

      const state = useStore.getState();
      expect(state.coupon.name).toBe('DISCOUNT10');
      expect(state.coupon.percentage).toBe(10);
      expect(state.discount).toBe(5000); // 10% de 50000
      expect(state.total).toBe(45000); // 50000 - 5000
    });

    test('should handle invalid coupon (NOT OK)', async () => {
      const store = useStore.getState();
      
      const mockCouponResponse = {
        name: '',
        message: 'Cupón no válido',
        percentage: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCouponResponse,
      });

      await store.applyCoupon('INVALID');

      const state = useStore.getState();
      expect(state.coupon.name).toBe('');
      expect(state.coupon.percentage).toBe(0);
      expect(state.discount).toBe(0);
      expect(state.total).toBe(50000); // Sin descuento
    });

    test('should handle network error (NOT OK)', async () => {
      const store = useStore.getState();

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(store.applyCoupon('NETWORK_ERROR')).rejects.toThrow('Network error');
    });

    test('should handle empty coupon name (OK NO DATA)', async () => {
      const store = useStore.getState();
      
      const mockCouponResponse = {
        name: '',
        message: 'Cupón vacío',
        percentage: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCouponResponse,
      });

      await store.applyCoupon('');

      const state = useStore.getState();
      expect(state.coupon.name).toBe('');
      expect(state.discount).toBe(0);
    });
  });

  describe('applyDiscount', () => {
    beforeEach(() => {
      const store = useStore.getState();
      store.addToCart(mockProduct); // 50000
      store.addToCart(mockProduct2); // 25000
    });

    test('should apply discount correctly (OK)', () => {
      const store = useStore.getState();

      // Simular cupón del 20% usando setState
      useStore.setState((state) => ({
        ...state,
        coupon: {
          ...state.coupon,
          percentage: 20
        }
      }));
      
      store.applyDiscount();

      const newState = useStore.getState();
      const expectedDiscount = (20 / 100) * 75000; // 15000
      const expectedTotal = 75000 - 15000; // 60000

      expect(newState.discount).toBe(expectedDiscount);
      expect(newState.total).toBe(expectedTotal);
    });

    test('should handle zero percentage discount (OK NO DATA)', () => {
      const store = useStore.getState();

      useStore.setState((state) => ({
        ...state,
        coupon: {
          ...state.coupon,
          percentage: 0
        }
      }));
      
      store.applyDiscount();

      const newState = useStore.getState();
      expect(newState.discount).toBe(0);
      expect(newState.total).toBe(75000); // Total sin descuento
    });

    test('should handle 100% discount (OK)', () => {
      const store = useStore.getState();

      useStore.setState((state) => ({
        ...state,
        coupon: {
          ...state.coupon,
          percentage: 100
        }
      }));
      
      store.applyDiscount();

      const newState = useStore.getState();
      expect(newState.discount).toBe(75000);
      expect(newState.total).toBe(0);
    });

    test('should apply discount on empty cart (OK NO DATA)', () => {
      const store = useStore.getState();

      store.clearCart();
      useStore.setState((state) => ({
        ...state,
        coupon: {
          ...state.coupon,
          percentage: 50
        }
      }));
      
      store.applyDiscount();

      const newState = useStore.getState();
      expect(newState.discount).toBe(0);
      expect(newState.total).toBe(0);
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      const store = useStore.getState();
      store.addToCart(mockProduct);
      store.addToCart(mockProduct2);
      // No aplicar cupón automáticamente para estos tests
    });

    test('should clear cart completely (OK)', () => {
      const store = useStore.getState();

      store.clearCart();

      const state = useStore.getState();
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.discount).toBe(0);
      expect(state.coupon.name).toBe('');
      expect(state.coupon.percentage).toBe(0);
      expect(state.coupon.message).toBe('');
    });

    test('should clear already empty cart (OK NO DATA)', () => {
      const store = useStore.getState();

      store.clearCart();
      store.clearCart(); // Limpiar de nuevo

      const state = useStore.getState();
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.discount).toBe(0);
    });
  });

  describe('Integration Tests - Complete Shopping Flow', () => {
    test('should handle complete shopping flow successfully (OK)', async () => {
      const store = useStore.getState();

      // Agregar productos
      store.addToCart(mockProduct);
      store.addToCart(mockProduct2);
      store.updateQuantity(1, 2);

      let state = useStore.getState();
      expect(state.total).toBe(125000);

      // Aplicar cupón
      const mockCouponResponse = {
        name: 'SAVE15',
        message: 'Descuento aplicado',
        percentage: 15,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCouponResponse,
      });

      await store.applyCoupon('SAVE15');

      state = useStore.getState();
      expect(state.discount).toBe(18750); // 15% de 125000
      expect(state.total).toBe(106250);

      // Remover un producto
      store.removeFromCart(2);

      state = useStore.getState();
      expect(state.total).toBe(85000); // (50000*2) - 15% = 85000

      // Limpiar carrito
      store.clearCart();

      state = useStore.getState();
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.coupon.name).toBe('');
    });

    test('should handle edge cases in shopping flow (NOT OK)', () => {
      const store = useStore.getState();

      // Intentar actualizar cantidad en carrito vacío
      store.updateQuantity(1, 5);

      let state = useStore.getState();
      expect(state.contents).toHaveLength(0);

      // Intentar remover de carrito vacío
      store.removeFromCart(1);

      state = useStore.getState();
      expect(state.contents).toHaveLength(0);

      // Calcular total en carrito vacío
      store.calculateTotal();

      state = useStore.getState();
      expect(state.total).toBe(0);
    });

    test('should maintain state consistency throughout operations (OK)', () => {
      const store = useStore.getState();

      store.addToCart(mockProduct);
      store.addToCart(mockProduct);
      store.addToCart(mockProduct);

      let state = useStore.getState();
      // Verificar que la cantidad se incrementó correctamente
      expect(state.contents[0].quantity).toBe(3);
      expect(state.total).toBe(150000);

      store.updateQuantity(1, 1);

      state = useStore.getState();
      // Verificar que el total se recalculó
      expect(state.total).toBe(50000);

      store.removeFromCart(1);

      state = useStore.getState();
      // Verificar que el carrito se limpió automáticamente
      expect(state.contents).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });
});

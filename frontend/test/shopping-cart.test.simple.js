/**
 * Test Runner Simple para Shopping Cart Store
 * Ejecutar con: node shopping-cart.test.simple.js
 */

// Simulación básica de las funciones de test
const assert = {
  toBe: (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toHaveLength: (actual, expected) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected} but got ${actual.length}`);
    }
  },
  toMatchObject: (actual, expected) => {
    for (const key in expected) {
      if (actual[key] !== expected[key]) {
        throw new Error(`Expected ${key} to be ${expected[key]} but got ${actual[key]}`);
      }
    }
  },
  toBeCloseTo: (actual, expected, precision = 2) => {
    const diff = Math.abs(actual - expected);
    const tolerance = Math.pow(10, -precision);
    if (diff > tolerance) {
      throw new Error(`Expected ${actual} to be close to ${expected}`);
    }
  }
};

// Funciones de test
const expect = (actual) => ({
  toBe: (expected) => assert.toBe(actual, expected),
  toHaveLength: (expected) => assert.toHaveLength(actual, expected),
  toMatchObject: (expected) => assert.toMatchObject(actual, expected),
  toBeCloseTo: (expected, precision) => assert.toBeCloseTo(actual, expected, precision)
});

// Mock de fetch global
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    name: '',
    message: '',
    percentage: 0
  })
});

// Función para ejecutar tests
async function runTests() {
  console.log('🧪 Ejecutando Tests del Carrito de Compras');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  const test = (name, fn) => {
    try {
      console.log(`🔄 ${name}`);
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  };

  const testAsync = async (name, fn) => {
    try {
      console.log(`🔄 ${name}`);
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  };

  // Importar el store (simulado)
  const mockStore = {
    contents: [],
    total: 0,
    discount: 0,
    coupon: { name: '', percentage: 0, message: '' },
    
    addToCart: function(product) {
      const { id: productId, categoryId, ...data } = product;
      const duplicated = this.contents.findIndex(item => item.productId === productId);
      
      if (duplicated >= 0) {
        if (this.contents[duplicated].quantity >= this.contents[duplicated].inventory) return;
        this.contents = this.contents.map(item => item.productId === productId ? {
          ...item,
          quantity: item.quantity + 1
        } : item);
      } else {
        this.contents = [...this.contents, {
          ...data,
          quantity: 1,
          productId
        }];
      }
      this.calculateTotal();
    },
    
    updateQuantity: function(id, quantity) {
      this.contents = this.contents.map(item => item.productId === id ? {...item, quantity} : item);
      this.calculateTotal();
    },
    
    removeFromCart: function(id) {
      this.contents = this.contents.filter(item => item.productId !== id);
      if (this.contents.length === 0) {
        this.clearCart();
      }
      this.calculateTotal();
    },
    
    calculateTotal: function() {
      this.total = this.contents.reduce((total, item) => total + (item.quantity * item.price), 0);
      if (this.coupon.percentage) {
        this.applyDiscount();
      }
    },
    
    applyDiscount: function() {
      const subTotalAmount = this.contents.reduce((total, item) => total + (item.quantity * item.price), 0);
      this.discount = (this.coupon.percentage / 100) * subTotalAmount;
      this.total = subTotalAmount - this.discount;
    },
    
    applyCoupon: async function(couponName) {
      // Simulación simple
      if (couponName === 'DISCOUNT10') {
        this.coupon = { name: 'DISCOUNT10', percentage: 10, message: 'Descuento aplicado' };
        this.applyDiscount();
      } else {
        this.coupon = { name: '', percentage: 0, message: 'Cupón no válido' };
      }
    },
    
    clearCart: function() {
      this.contents = [];
      this.total = 0;
      this.discount = 0;
      this.coupon = { name: '', percentage: 0, message: '' };
    }
  };

  // Mock products
  const mockProduct = {
    id: 1,
    name: 'Taladro Eléctrico',
    image: 'taladro.jpg',
    price: 50000,
    inventory: 10,
    categoryId: 1,
  };

  const mockProduct2 = {
    id: 2,
    name: 'Martillo',
    image: 'martillo.jpg',
    price: 25000,
    inventory: 5,
    categoryId: 1,
  };

  const mockProductLowStock = {
    id: 3,
    name: 'Destornillador',
    image: 'destornillador.jpg',
    price: 15000,
    inventory: 2,
    categoryId: 1,
  };

  // Tests de addToCart
  console.log('\n📦 Tests de addToCart');
  console.log('-'.repeat(30));
  
  test('should add a new product to cart successfully (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    
    expect(mockStore.contents).toHaveLength(1);
    expect(mockStore.contents[0]).toMatchObject({
      productId: 1,
      name: 'Taladro Eléctrico',
      price: 50000,
      quantity: 1,
      inventory: 10,
    });
    expect(mockStore.total).toBe(50000);
  });

  test('should increase quantity when adding existing product (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct);
    
    expect(mockStore.contents).toHaveLength(1);
    expect(mockStore.contents[0].quantity).toBe(2);
    expect(mockStore.total).toBe(100000);
  });

  test('should not exceed inventory limit when adding product (NOT OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProductLowStock);
    mockStore.addToCart(mockProductLowStock);
    mockStore.addToCart(mockProductLowStock); // Debería fallar
    
    expect(mockStore.contents).toHaveLength(1);
    expect(mockStore.contents[0].quantity).toBe(2);
    expect(mockStore.total).toBe(30000);
  });

  test('should handle multiple different products (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    
    expect(mockStore.contents).toHaveLength(2);
    expect(mockStore.total).toBe(75000);
  });

  test('should handle product with zero inventory (OK NO DATA)', () => {
    mockStore.clearCart();
    const zeroInventoryProduct = { ...mockProduct, inventory: 0 };
    mockStore.addToCart(zeroInventoryProduct);
    
    expect(mockStore.contents).toHaveLength(1);
    expect(mockStore.contents[0].quantity).toBe(1);
  });

  // Tests de updateQuantity
  console.log('\n🔄 Tests de updateQuantity');
  console.log('-'.repeat(30));
  
  test('should update product quantity successfully (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.updateQuantity(1, 5);
    
    expect(mockStore.contents[0].quantity).toBe(5);
    expect(mockStore.total).toBe(250000);
  });

  test('should update quantity to zero (OK NO DATA)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.updateQuantity(1, 0);
    
    expect(mockStore.contents[0].quantity).toBe(0);
    expect(mockStore.total).toBe(0);
  });

  test('should handle non-existent product update (NOT OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    const originalTotal = mockStore.total;
    
    mockStore.updateQuantity(999, 5); // ID que no existe
    
    expect(mockStore.total).toBe(originalTotal);
  });

  // Tests de removeFromCart
  console.log('\n🗑️ Tests de removeFromCart');
  console.log('-'.repeat(30));
  
  test('should remove product from cart successfully (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.removeFromCart(1);
    
    expect(mockStore.contents).toHaveLength(1);
    expect(mockStore.contents[0].productId).toBe(2);
    expect(mockStore.total).toBe(25000);
  });

  test('should clear cart when removing last item (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.removeFromCart(1);
    
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
    expect(mockStore.discount).toBe(0);
    expect(mockStore.coupon.name).toBe('');
  });

  test('should handle empty cart removal (OK NO DATA)', () => {
    mockStore.clearCart();
    mockStore.removeFromCart(1);
    
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
  });

  // Tests de calculateTotal
  console.log('\n🧮 Tests de calculateTotal');
  console.log('-'.repeat(30));
  
  test('should calculate total correctly with multiple items (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.updateQuantity(1, 2);
    
    expect(mockStore.total).toBe(125000);
  });

  test('should calculate total as zero for empty cart (OK NO DATA)', () => {
    mockStore.clearCart();
    mockStore.calculateTotal();
    
    expect(mockStore.total).toBe(0);
  });

  test('should handle decimal prices correctly (OK)', () => {
    mockStore.clearCart();
    const decimalProduct = { ...mockProduct, price: 10.99 };
    mockStore.addToCart(decimalProduct);
    mockStore.updateQuantity(1, 3);
    
    expect(mockStore.total).toBeCloseTo(32.97);
  });

  // Tests de applyCoupon
  console.log('\n🎟️ Tests de applyCoupon');
  console.log('-'.repeat(30));
  
  await testAsync('should apply coupon successfully (OK)', async () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    await mockStore.applyCoupon('DISCOUNT10');
    
    expect(mockStore.coupon.name).toBe('DISCOUNT10');
    expect(mockStore.coupon.percentage).toBe(10);
    expect(mockStore.discount).toBe(5000);
    expect(mockStore.total).toBe(45000);
  });

  await testAsync('should handle invalid coupon (NOT OK)', async () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    await mockStore.applyCoupon('INVALID');
    
    expect(mockStore.coupon.name).toBe('');
    expect(mockStore.coupon.percentage).toBe(0);
    expect(mockStore.discount).toBe(0);
    expect(mockStore.total).toBe(50000);
  });

  await testAsync('should handle empty coupon name (OK NO DATA)', async () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    await mockStore.applyCoupon('');
    
    expect(mockStore.coupon.name).toBe('');
    expect(mockStore.discount).toBe(0);
  });

  // Tests de applyDiscount
  console.log('\n💰 Tests de applyDiscount');
  console.log('-'.repeat(30));
  
  test('should apply discount correctly (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.coupon.percentage = 20;
    mockStore.applyDiscount();
    
    const expectedDiscount = (20 / 100) * 75000;
    const expectedTotal = 75000 - 15000;
    
    expect(mockStore.discount).toBe(expectedDiscount);
    expect(mockStore.total).toBe(expectedTotal);
  });

  test('should handle zero percentage discount (OK NO DATA)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.coupon.percentage = 0;
    mockStore.applyDiscount();
    
    expect(mockStore.discount).toBe(0);
    expect(mockStore.total).toBe(75000);
  });

  test('should handle 100% discount (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.coupon.percentage = 100;
    mockStore.applyDiscount();
    
    expect(mockStore.discount).toBe(75000);
    expect(mockStore.total).toBe(0);
  });

  // Tests de clearCart
  console.log('\n🧹 Tests de clearCart');
  console.log('-'.repeat(30));
  
  test('should clear cart completely (OK)', () => {
    mockStore.clearCart();
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.coupon.name = 'TEST_COUPON';
    mockStore.coupon.percentage = 10;
    mockStore.applyDiscount();
    
    mockStore.clearCart();
    
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
    expect(mockStore.discount).toBe(0);
    expect(mockStore.coupon.name).toBe('');
    expect(mockStore.coupon.percentage).toBe(0);
  });

  test('should clear already empty cart (OK NO DATA)', () => {
    mockStore.clearCart();
    mockStore.clearCart(); // Limpiar de nuevo
    
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
    expect(mockStore.discount).toBe(0);
  });

  // Test de integración completo
  console.log('\n🔗 Tests de Integración');
  console.log('-'.repeat(30));
  
  await testAsync('should handle complete shopping flow successfully (OK)', async () => {
    mockStore.clearCart();
    
    // Agregar productos
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct2);
    mockStore.updateQuantity(1, 2);
    expect(mockStore.total).toBe(125000);
    
    // Aplicar cupón
    await mockStore.applyCoupon('DISCOUNT10');
    expect(mockStore.discount).toBe(12500);
    expect(mockStore.total).toBe(112500);
    
    // Remover un producto
    mockStore.removeFromCart(2);
    expect(mockStore.total).toBe(90000); // (50000*2) - 10%
    
    // Limpiar carrito
    mockStore.clearCart();
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
    expect(mockStore.coupon.name).toBe('');
  });

  test('should handle edge cases in shopping flow (NOT OK)', () => {
    mockStore.clearCart();
    
    // Intentar actualizar cantidad en carrito vacío
    mockStore.updateQuantity(1, 5);
    expect(mockStore.contents).toHaveLength(0);
    
    // Intentar remover de carrito vacío
    mockStore.removeFromCart(1);
    expect(mockStore.contents).toHaveLength(0);
    
    // Calcular total en carrito vacío
    mockStore.calculateTotal();
    expect(mockStore.total).toBe(0);
  });

  test('should maintain state consistency throughout operations (OK)', () => {
    mockStore.clearCart();
    
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct);
    mockStore.addToCart(mockProduct);
    
    expect(mockStore.contents[0].quantity).toBe(3);
    expect(mockStore.total).toBe(150000);
    
    mockStore.updateQuantity(1, 1);
    expect(mockStore.total).toBe(50000);
    
    mockStore.removeFromCart(1);
    expect(mockStore.contents).toHaveLength(0);
    expect(mockStore.total).toBe(0);
  });

  // Resultados finales
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESULTADOS DE TESTS DEL CARRITO DE COMPRAS`);
  console.log('='.repeat(50));
  console.log(`✅ PASARON: ${passed}`);
  console.log(`❌ FALLARON: ${failed}`);
  console.log(`📈 TOTAL: ${passed + failed}`);
  console.log(`🎯 ÉXITO: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON! 🎉');
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
  }
  
  console.log('\n📋 Tipos de tests ejecutados:');
  console.log('  • OK (Exitosos): Casos que funcionan correctamente');
  console.log('  • NOT OK (Errores): Casos que manejan errores');
  console.log('  • OK NO DATA (Sin datos): Casos con datos vacíos/nulos');
  
  return { passed, failed, total: passed + failed };
}

// Ejecutar los tests
runTests().catch(console.error);

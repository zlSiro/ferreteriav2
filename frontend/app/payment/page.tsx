'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/src/store';
import ShoppingCartItem from '@/components/cart/ShoppingCartItem';
import Amount from '@/components/cart/Amount';
import { PaymentFormData, paymentSchema } from '@/src/schemas';
import { toast } from 'react-toastify';
import { ZodError } from 'zod';
import Link from 'next/link';
import { submitOrder } from '@/actions/submit-order-action';

export default function PaymentPage() {
  const router = useRouter();
  
  // Estados del carrito desde Zustand
  const contents = useStore(state => state.contents);
  const total = useStore(state => state.total);
  const discount = useStore(state => state.discount);
  const coupon = useStore(state => state.coupon.name);
  const clearCart = useStore(state => state.clearCart);

  // Estado para el formulario de pago
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    buyOrder: `ORDER_${Date.now()}`,
    sessionId: `SESSION_${Date.now()}`,
    returnUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/payment/confirm`,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Actualizar el monto cuando cambie el total del carrito
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      amount: total 
    }));
  }, [total]);

  // Verificar si hay productos en el carrito
  useEffect(() => {
    if (contents.length === 0) {
      toast.error('No hay productos en el carrito');
      router.push('/');
    }
  }, [contents, router]);

  const handlePayment = async () => {
    if (contents.length === 0) {
      toast.error('No hay productos en el carrito');
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar datos para guardar en la base de datos
      const orderData = {
        total,
        coupon,
        contents
      };

      // Primero, guardar la orden en la base de datos
      const orderResult = await submitOrder(orderData);
      
      if (orderResult.errors.length > 0) {
        orderResult.errors.forEach(error => toast.error(error));
        return;
      }

      // Si la orden se guardó exitosamente, proceder con el pago
      const paymentData = {
        ...formData,
        orderDetails: {
          contents,
          coupon,
          discount,
          total,
          timestamp: new Date().toISOString()
        }
      };

      // Validar los datos del pago
      paymentSchema.parse(formData);

      // Enviar al backend para crear el pago en Transbank
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar el pago');
      }

      const { url, token } = await response.json();

      // Crear formulario dinámico para redirigir a Webpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = token;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Error al procesar el pago. Intenta nuevamente.');
        console.error('Error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay productos, mostrar mensaje de carga mientras redirige
  if (contents.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header con botón de volver */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-block rounded bg-green-400 hover:bg-green-500 font-bold py-2 px-6 text-white transition-colors"
        >
          ← Volver al carrito
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Resumen del pedido */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Confirmar Pedido</h1>
          
          {/* Lista de productos */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Productos en tu pedido</h2>
            <ul className="divide-y divide-gray-200">
              {contents.map(item => (
                <ShoppingCartItem key={item.productId} item={item} />
              ))}
            </ul>
          </div>

          {/* Resumen de precios */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>
            <dl className="space-y-3">
              {discount > 0 && (
                <Amount 
                  label="Descuento aplicado" 
                  amount={discount} 
                  discount={true} 
                />
              )}
              {coupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <dt>Cupón aplicado:</dt>
                  <dd className="font-medium">{coupon}</dd>
                </div>
              )}
              <Amount 
                label="Total a Pagar" 
                amount={total} 
              />
            </dl>
          </div>
        </div>

        {/* Columna derecha - Información de pago */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Información de Pago</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">Monto a pagar:</p>
                <p className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">Orden ID:</p>
                <p className="font-mono text-sm">{formData.buyOrder}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">Sesión ID:</p>
                <p className="font-mono text-sm">{formData.sessionId}</p>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={handlePayment}
              disabled={isLoading || contents.length === 0}
              className={`w-full text-white p-4 rounded-lg font-bold text-lg transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                `Pagar $${total.toLocaleString()} con Webpay`
              )}
            </button>

            {/* Información adicional */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Serás redirigido a Webpay para completar el pago de forma segura.</p>
              <p className="mt-1">Al continuar, aceptas nuestros términos y condiciones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
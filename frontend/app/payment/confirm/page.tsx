'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useStore } from '@/src/store';

interface PaymentResult {
  status: string;
  amount: number;
  buy_order: string;
  transaction_date: string;
  authorization_code?: string;
  payment_type_code?: string;
  response_code?: number;
  installments_number?: number;
  card_detail?: {
    card_number: string;
  };
}

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token_ws');
  
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Limpiar carrito después de pago exitoso
  const clearCart = useStore(state => state.clearCart);

  useEffect(() => {
    if (token) {
      const confirmTransaction = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/confirm?token_ws=${token}`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.success) {
            setResult(data.data);
            // Si el pago fue exitoso, limpiar el carrito
            if (data.data.status === 'AUTHORIZED') {
              clearCart();
              toast.success('¡Pago confirmado con éxito!');
            }
          } else {
            setError(data.error);
            toast.error('Error al confirmar el pago');
          }
        } catch (err) {
          setError('Error al confirmar la transacción');
          toast.error('Error al confirmar la transacción');
          console.error('Error detallado:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      confirmTransaction();
    } else {
      setError('Token de transacción no válido');
      setIsLoading(false);
    }
  }, [token, clearCart]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'REJECTED':
      case 'FAILED':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return {
          title: '¡Pago Exitoso!',
          description: 'Tu transacción ha sido procesada correctamente.',
          color: 'text-green-800'
        };
      case 'REJECTED':
        return {
          title: 'Pago Rechazado',
          description: 'La transacción fue rechazada por el banco.',
          color: 'text-red-800'
        };
      case 'FAILED':
        return {
          title: 'Pago Fallido',
          description: 'Hubo un error al procesar tu pago.',
          color: 'text-red-800'
        };
      default:
        return {
          title: 'Estado del Pago',
          description: 'Revisa los detalles de tu transacción.',
          color: 'text-yellow-800'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Estados de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Procesando pago...</h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu transacción.</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error en el Pago</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Volver a la Tienda
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Esperando respuesta del servidor...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(result.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header con botón de volver */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a la tienda
          </Link>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header de la tarjeta */}
          <div className="text-center py-8 px-6 border-b">
            {getStatusIcon(result.status)}
            <h1 className={`text-3xl font-bold mb-2 ${statusInfo.color}`}>
              {statusInfo.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {statusInfo.description}
            </p>
          </div>

          {/* Detalles de la transacción */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles de la Transacción</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Monto Pagado</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {formatAmount(result.amount)}
                </dd>
              </div>

              {/* Estado */}
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Estado</dt>
                <dd className={`text-lg font-semibold ${
                  result.status === 'AUTHORIZED' ? 'text-green-600' :
                  result.status === 'REJECTED' || result.status === 'FAILED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {result.status === 'AUTHORIZED' ? 'Autorizado' :
                   result.status === 'REJECTED' ? 'Rechazado' :
                   result.status === 'FAILED' ? 'Fallido' : result.status}
                </dd>
              </div>

              {/* Número de orden */}
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Número de Orden</dt>
                <dd className="text-lg font-mono text-gray-900">
                  {result.buy_order}
                </dd>
              </div>

              {/* Fecha */}
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</dt>
                <dd className="text-lg text-gray-900">
                  {formatDate(result.transaction_date)}
                </dd>
              </div>

              {/* Código de autorización */}
              {result.authorization_code && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Código de Autorización</dt>
                  <dd className="text-lg font-mono text-gray-900">
                    {result.authorization_code}
                  </dd>
                </div>
              )}

              {/* Últimos 4 dígitos de la tarjeta */}
              {result.card_detail?.card_number && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Tarjeta Utilizada</dt>
                  <dd className="text-lg font-mono text-gray-900">
                    **** **** **** {result.card_detail.card_number}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continuar Comprando
              </button>
              
              {result.status === 'AUTHORIZED' && (
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Imprimir Comprobante
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-blue-800 text-sm mb-3">
            Si tienes alguna consulta sobre tu compra, no dudes en contactarnos.
          </p>
          <div className="text-sm text-blue-700">
            <p>📧 Email: soporte@tienda.com</p>
            <p>📞 Teléfono: +56 2 1234 5678</p>
          </div>
        </div>
      </div>
    </div>
  );
}
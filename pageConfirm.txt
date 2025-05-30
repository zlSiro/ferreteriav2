'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import { Spinner } from '@/components/ui/Spinner';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token_ws');
  const orderId = searchParams.get('order');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de pago no encontrado');
      setIsLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/confirm?token_ws=${token}`,
          {
            method: 'GET', // Cambiado a POST para mejor seguridad
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Error al confirmar el pago');
        }

        setPaymentData(result.data);
        toast.success('¡Pago confirmado exitosamente!');
      } catch (err) {
        console.error('Error en confirmación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        toast.error('Hubo un problema al confirmar tu pago');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [token]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Spinner className="mx-auto my-8" />
        <p className="text-lg">Verificando tu pago...</p>
        {orderId && (
          <p className="text-sm text-gray-500 mt-2">
            Orden: {orderId}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Heading>Error en el pago</Heading>
          <p className="mb-4">{error}</p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-center"
            >
              Volver al inicio
            </Link>
            <Link
              href="/cart"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
            >
              Reintentar pago
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No se recibieron datos del pago</p>
        <Link
          href="/"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-500 p-4 text-white">
          <Heading>¡Pago Exitoso!</Heading>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Resumen del Pago</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Estado:</dt>
                  <dd className="font-medium">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {paymentData.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Monto:</dt>
                  <dd className="font-medium">${paymentData.amount.toLocaleString('es-CL')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Orden:</dt>
                  <dd className="font-mono">{paymentData.buy_order}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Fecha:</dt>
                  <dd className="font-medium">
                    {new Date(paymentData.transaction_date).toLocaleString('es-CL')}
                  </dd>
                </div>
                {paymentData.card_number && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tarjeta:</dt>
                    <dd className="font-medium">**** **** **** {paymentData.card_number}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Siguientes pasos</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>Recibirás un correo con los detalles de tu compra</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🛒</span>
                  <span>Puedes ver el estado de tu pedido en tu cuenta</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📦</span>
                  <span>Recibirás actualizaciones sobre el envío</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              href="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded text-center"
            >
              Seguir comprando
            </Link>
            <Link
              href="/orders"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-center"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
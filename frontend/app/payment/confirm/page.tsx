'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token_ws');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Token recibido en confirm.tsx:', token);
    if (token) {
      const confirmTransaction = async () => {
        try {
          console.log('Solicitando a:', `${process.env.NEXT_PUBLIC_API_URL}/payment/confirm?token_ws=${token}`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/confirm?token_ws=${token}`, {
            method: 'GET',
          });

          console.log('Respuesta del servidor:', response);
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Datos recibidos:', data);
          if (data.success) {
            setResult(data.data);
            toast.success('Pago confirmado con éxito');
          } else {
            setError(data.error);
            toast.error('Error al confirmar el pago');
          }
        } catch (err) {
          setError('Error al confirmar la transacción');
          toast.error('Error al confirmar la transacción');
          console.error('Error detallado:', err);
        }
      };
      confirmTransaction();
    }
  }, [token]);

  if (!token) return <div className="container mx-auto p-4">Esperando redirección de Webpay...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!result) return <div className="container mx-auto p-4">Procesando pago...</div>;

  return (
    <>
      <Link
        href="/admin/products?page=1"
        className="rounded bg-green-400 font-bold py-2 px-10"
      >Volver</Link>
      <Heading>Confirma tu compra</Heading>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Resultado del Pago</h1>
        <div className="space-y-2">
          <p><strong>Estado:</strong> {result.status}</p>
          <p><strong>Monto:</strong> {result.amount}</p>
          <p><strong>Orden:</strong> {result.buy_order}</p>
          <p><strong>Fecha:</strong> {result.transaction_date}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </>
  );
}
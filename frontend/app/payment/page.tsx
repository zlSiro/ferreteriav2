'use client'; // Marca este componente como un Client Component
import { PaymentFormData, paymentSchema } from '@/src/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ZodError } from 'zod';

export default function PaymentPage() {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 1000,
    buyOrder: `ORDER_${Date.now()}`,
    sessionId: `SESSION_${Date.now()}`,
    returnUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/payment/confirm`,
  });

  const handlePayment = async () => {
    try {
      // Validar los datos
      paymentSchema.parse(formData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        toast.error('Error al iniciar el pago. Revisa la consola.');
        console.error('Error:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  return (
    <>
      <Link
        href="/admin/products/new"
        className="rounded bg-green-400 font-bold py-2 px-10"
      >Volver</Link>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Pago con Webpay</h1>
        <div className="space-y-4">
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Monto"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="buyOrder"
            value={formData.buyOrder}
            onChange={handleChange}
            placeholder="ID de la orden"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="sessionId"
            value={formData.sessionId}
            onChange={handleChange}
            placeholder="ID de sesión"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="returnUrl"
            value={formData.returnUrl}
            onChange={handleChange}
            placeholder="URL de retorno"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handlePayment}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Pagar con Webpay
          </button>
        </div>
      </div>
    </>
  );
}
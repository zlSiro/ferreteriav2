"use client";

import React, { useEffect, useState } from "react";

type DolarData = {
  fecha: string;
  valor: number;
};

const DolarValue : React.FC = () => {
  const [dolar, setDolar] = useState<DolarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const res = await fetch(`http://localhost:3000/indicadores/dolar`);
        if (!res.ok) {
          throw new Error('Error al obtener el valor del dolar')
        }

        const data: DolarData = await res.json();
        setDolar(data)
      } catch (error : any) {
        setError(error.message || 'Error desconocido')
      } finally {
        setLoading(false);
      }
    };

    fetchDolar()
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error : {error}</p>;
  if (!dolar) return <p>No hay datos disponibles</p>;

  //const fechaFormateada = new Date(dolar.fecha).toLocaleDateString('es-CL');
  const fechaFormateada = new Date(dolar.fecha).toISOString().split('T')[0];

  return (
    <div className="py-5 text-center">
      <h2>💵 Valor del Dólar</h2>
      <p>Fecha: {fechaFormateada}</p>
      <p>Valor: ${dolar.valor}</p>
    </div>
  );
};

export default DolarValue;
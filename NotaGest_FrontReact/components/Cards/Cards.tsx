'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Arquivo {
  _id: string;
  value: number;
  property: string;
}

const Cards: React.FC = () => {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchArquivos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/api/uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setArquivos(response.data);
      } catch (error) {
        console.error("Erro ao buscar arquivos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArquivos();
  }, [BASE_URL]);

  if (loading) {
    return <p>Carregando métricas...</p>;
  }

  const totalUploads = arquivos.length;
  const totalSpent = arquivos.reduce((acc, file) => acc + file.value, 0);
  const uniqueProperties = new Set(arquivos.map((file) => file.property)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1 - Quantidade de uploads */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-gray-500 uppercase">
            Quantidade de uploads
          </h2>
        </div>
        <p className="text-3xl font-extrabold text-[#0c4a6e]">{totalUploads}</p>
        <span className="text-xs text-gray-500 mt-1 block">
          <span className="text-green-600 font-semibold">+0%</span> desde o mês passado
        </span>
      </div>

      {/* Card 2 - Total gasto */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-gray-500 uppercase">
            Total gasto
          </h2>
        </div>
        <p className="text-3xl font-extrabold text-[#0c4a6e]">
          R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          Valor acumulado em todas as notas
        </span>
      </div>

      {/* Card 3 - Imóveis cadastrados */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-gray-500 uppercase">
            Imóveis cadastrados
          </h2>
        </div>
        <p className="text-3xl font-extrabold text-[#0c4a6e]">{uniqueProperties}</p>
        <span className="text-xs text-gray-500 mt-1 block">
          Total de imóveis com notas fiscais registradas
        </span>
      </div>
    </div>
  );
};

export default Cards;

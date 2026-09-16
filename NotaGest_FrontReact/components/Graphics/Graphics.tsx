'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';
import Cards from '../Cards/Cards';

interface FileData {
  _id: string;
  title: string;
  value: number;
  purchaseDate: string;
  category: string;
  subcategory: string;
  property: string | { nome: string }; 
  filePath: string;
}

interface GraphicsProps {
  files: FileData[];
}

const Graphics: React.FC<GraphicsProps> = ({ files }) => {


  const getPropertyName = (property: string | { nome: string }) => {
    return typeof property === "object" ? property.nome : property;
  };

  // Agrupar valor total por categoria
  const categoryData = files.reduce<{ name: string; value: number }[]>((acc, file) => {
    const index = acc.findIndex(item => item.name === file.category);
    if (index >= 0) acc[index].value += file.value;
    else acc.push({ name: file.category, value: file.value });
    return acc;
  }, []);

  // Agrupar valor total por subcategoria
  const subcategoryData = files.reduce<{ name: string; value: number }[]>((acc, file) => {
    const index = acc.findIndex(item => item.name === file.subcategory);
    if (index >= 0) acc[index].value += file.value;
    else acc.push({ name: file.subcategory, value: file.value });
    return acc;
  }, []);

  return (
    <div className="px-4 lg:px-16 py-10 space-y-10">

      {/* Cards superiores */}
      <Cards />

      {/* Linha com os dois gráficos */}
      <div className="flex flex-col lg:flex-row gap-10 mt-20">

        {/* Valor por Categoria */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Valor por Categoria</h2>

          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Não há dados suficientes para gerar o gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0c4a6e" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Valor por Subcategoria */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Valor por Subcategoria</h2>

          {subcategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Não há dados suficientes para gerar o gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subcategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#FF8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

    </div>
  );
};

export default Graphics;
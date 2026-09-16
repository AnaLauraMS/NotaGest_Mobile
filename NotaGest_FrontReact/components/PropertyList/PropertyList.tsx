'use client';

import React, { useState, useMemo } from 'react';
import { IoTrashBinSharp } from 'react-icons/io5';
import Swal from 'sweetalert2';

interface PropertyDataForUI {
  _id: string;
  nome: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo?: string;
  cep?: string;
}

interface PropertyListProps {
  properties: PropertyDataForUI[];
  deleteProperty: (_id: string) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties: initialProperties}) => {

  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



  // 🗑 Função de deletar com SweetAlert2
  const handleDeleteProperty = async (_id: string) => {

    // 🔥 Popup de confirmação
    const result = await Swal.fire({
      title: 'Excluir imóvel?',
      text: 'Deseja realmente excluir este imóvel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/api/imoveis/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // ❌ Se der erro, mostra sweetalert com a mensagem do backend
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Erro ao excluir." }));

        Swal.fire({
          title: 'Erro!',
          text: data.message || 'Não foi possível excluir o imóvel.',
          icon: 'error',
          confirmButtonText: 'OK'
        });

        return;
      }

      // 🟢 Sucesso
      Swal.fire({
        title: 'Excluído!',
        text: 'O imóvel foi excluído com sucesso.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // Atualiza a tabela localmente
      setProperties(prev => prev.filter(item => item._id !== _id));

    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: 'Ocorreu um erro ao tentar excluir o imóvel.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      console.error("Erro ao deletar imóvel:", error);
    }
  };

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    if (tipoFilter) {
      filtered = filtered.filter(p => p.tipo === tipoFilter);
    }
    return filtered;
  }, [properties, search, tipoFilter]);

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  return (
    <div className="p-4 mt-6">

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-8">

        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />

        <div className="w-full md:w-1/4 relative">
          <select
            value={tipoFilter}
            onChange={e => setTipoFilter(e.target.value)}
            className="border px-3 py-2 rounded w-full text-left"
          >
            <option value="">Todos os tipos</option>
            {[...new Set(properties.map(p => p.tipo))].map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Nome</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Endereço</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Cidade</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Estado</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProperties.map(prop => (
              <tr key={prop._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-2">{prop.nome}</td>
                <td className="px-4 py-2">{`${prop.rua || ''}, ${prop.numero || ''} - ${prop.bairro || ''}`}</td>
                <td className="px-4 py-2">{prop.cidade}</td>
                <td className="px-4 py-2">{prop.estado}</td>
                <td className="px-4 py-2">{prop.tipo}</td>

                {/* Botão de deletar */}
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="text-red-600 hover:text-red-800 p-1 rounded border border-gray-200"
                    onClick={() => handleDeleteProperty(prop._id)}
                  >
                    <IoTrashBinSharp size={20} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Próxima
        </button>
      </div>

    </div>
  );
};

export default PropertyList;

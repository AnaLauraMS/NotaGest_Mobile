'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { IoTrashBinSharp, IoDownloadOutline, IoPencilOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface FileData {
  _id: string;
  title: string;
  value: number;
  purchaseDate: string;
  category: string;
  subcategory: string;
  property: string | { _id: string; nome: string };
}

export interface FileListProps {
  files: FileData[];
  deleteFile?: (_id: string) => void; 
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  const [filesState, setFilesState] = useState<FileData[]>(files);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  // Atualiza o estado interno se os props mudarem
  useEffect(() => {
    setFilesState(files);
  }, [files]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  };

  const handleDownloadProperty = async (file: any) => {
  if (!file.filePath) {
    Swal.fire('Erro!', 'Arquivo sem caminho válido!', 'error');
    return;
  }

  try {
    const url = `${BASE_URL}/uploads/${file.filePath}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao baixar arquivo");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;

    // Nome do arquivo
    const fileExtension = file.filePath.split('.').pop();
    link.download = `${file.title}.${fileExtension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    Swal.fire("Erro!", "Não foi possível baixar o arquivo!", "error");
  }
};


  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter esta ação!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/api/uploads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Erro ao deletar arquivo');
      }

      // Remove o arquivo do estado local
      setFilesState(prev => prev.filter(f => f._id !== id));

      Swal.fire('Deletado!', 'O arquivo foi deletado com sucesso.', 'success');
    } catch (error: any) {
      Swal.fire('Erro!', 'Não foi possível deletar o arquivo: ' + error.message, 'error');
    }
  };

  const filteredFiles = useMemo(() => {
    let filtered = filesState.filter(f =>
      f.title.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter) filtered = filtered.filter(f => f.category === categoryFilter);
    return filtered;
  }, [filesState, search, categoryFilter]);

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / ITEMS_PER_PAGE));

  const handleEditProperty = (id: string) => console.log('Editar arquivo', id);

  return (
    <div className="p-4 mt-6">

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-8">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <div className="w-full md:w-1/4">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Todas as categorias</option>
            {[...new Set(filesState.map(f => f.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Título</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Valor</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Data da Compra</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Imóvel</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Categoria</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Subcategoria</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedFiles.map(file => (
              <tr key={file._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-2">{file.title}</td>
                <td className="px-4 py-2">R$ {file.value.toFixed(2)}</td>
                <td className="px-4 py-2">{formatDate(file.purchaseDate)}</td>
                <td className="px-4 py-2">
                  {typeof file.property === 'object' ? file.property.nome : file.property}
                </td>
                <td className="px-4 py-2">{file.category}</td>
                <td className="px-4 py-2">{file.subcategory}</td>
                <td className="px-4 py-2 flex gap-2">
                
                  <button
                    className="text-green-600 hover:text-green-800 p-1 rounded border border-gray-200"
                    onClick={() => handleDownloadProperty(file)}
                  >
                    <IoDownloadOutline size={20} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-1 rounded border border-gray-200"
                    onClick={() => handleDelete(file._id)}
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

export default FileList;

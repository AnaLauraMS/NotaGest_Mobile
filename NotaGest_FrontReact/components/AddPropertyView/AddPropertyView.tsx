'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../utils/api';

interface AddPropertyViewProps {
  onAddProperty: (property: string) => void;
}

const AddPropertyView: React.FC<AddPropertyViewProps> = ({ onAddProperty }) => {
  const [nome, setNome] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');

  const propertyTypes = ['Casa', 'Apartamento', 'Sítio', 'Chácara', 'Comercial'];

  const fetchAddressByCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
      } else {
        Swal.fire('Erro', 'CEP não encontrado.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro ao buscar o CEP.', 'error');
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value.replace(/\D/g, '');
    setCep(newCep);
    if (newCep.length === 8) fetchAddressByCep(newCep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Erro', 'Sessão expirada. Faça login novamente.', 'error');
        return;
      }

      const response = await api.post(
        '/api/imoveis',
        {
          nome,
          cep,
          rua,
          numero,
          bairro,
          cidade,
          estado,
          tipo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        Swal.fire('Sucesso', 'Imóvel cadastrado com sucesso!', 'success');
        setNome('');
        setCep('');
        setRua('');
        setNumero('');
        setBairro('');
        setCidade('');
        setEstado('');
        setTipo('');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar imóvel:', error);
      if (error.response?.status === 401) {
        Swal.fire('Erro', 'Sessão expirada. Faça login novamente.', 'error');
      } else if (error.response?.data?.message) {
        Swal.fire('Erro', error.response.data.message, 'error');
      } else {
        Swal.fire('Erro', 'Erro inesperado ao cadastrar imóvel.', 'error');
      }
    }
  };

  return (
    <div className="bg-white min-h-screen pt-10 px-4">
      <div className="max-w-5xl w-full mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-[#0c4a6e] leading-tight">
            Adicionar Novo Imóvel
          </h2>
          <p className="mt-5 text-sm text-[#2f6687]">
            Cadastre as informações completas do novo imóvel.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome do Imóvel"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
            <input
              type="text"
              placeholder="CEP"
              value={cep}
              onChange={handleCepChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
          </div>

          <input
            type="text"
            placeholder="Rua"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
            <input
              type="text"
              placeholder="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            >
              <option value="" disabled>Tipo de imóvel</option>
              {propertyTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-2 font-bold text-white rounded-lg bg-[#0c4a6e] hover:bg-[#09415c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c4a6e]"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyView;
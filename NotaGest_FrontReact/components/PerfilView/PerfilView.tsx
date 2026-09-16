'use client';

import React, { useEffect, useState } from 'react';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

interface User {
  _id: string;
  nome: string;
  email: string;
}

const PerfilView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ================================
  // 🔹 CARREGAR DADOS DO PERFIL
  // ================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado.');

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Erro ao carregar perfil.');

        const data: User = await res.json();
        setUser(data);
        setFormData({ name: data.nome });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: err.message,
          confirmButtonColor: '#b91c1c',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ================================
  // 🔹 ATUALIZAR PERFIL (NOME)
  // ================================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: formData.name }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar perfil.');

      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Perfil atualizado com sucesso.',
        confirmButtonColor: '#0c4a6e',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: err.message,
        confirmButtonColor: '#b91c1c',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ================================
  // 🔹 ALTERAR SENHA
  // ================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'As senhas não coincidem.',
        confirmButtonColor: '#b91c1c',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Erro ao alterar senha.');

      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Senha alterada com sucesso.',
        confirmButtonColor: '#0c4a6e',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: err.message,
        confirmButtonColor: '#b91c1c',
      });
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen px-4 pt-10">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-xl border border-gray-100">

        {/* Título */}
        <h2 className="text-3xl font-bold text-[#0c4a6e] flex items-center justify-center mb-8">
          <UserIcon className="w-7 h-7 mr-2 text-blue-600" />
          Meu Perfil
        </h2>

        {/* =============================== */}
        {/* 🔹 INFORMAÇÕES BÁSICAS */}
        {/* =============================== */}
        <h3 className="text-xl font-semibold text-[#0c4a6e] mb-4 border-b pb-2">
          Informações Básicas
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-6 mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              value={user?.email || ''}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-[#0c4a6e] text-white rounded-lg hover:bg-[#09415c]"
          >
            {isUpdating ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        {/* =============================== */}
        {/* 🔹 ALTERAR SENHA */}
        {/* =============================== */}
        <h3 className="text-xl font-semibold text-[#0c4a6e] mb-4 border-b pb-2 flex items-center">
          <LockClosedIcon className="w-5 h-5 mr-2 text-blue-600" />
          Alterar Senha
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-[#0c4a6e] text-white rounded-lg hover:bg-[#09415c]"
          >
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerfilView;

'use client';
import React, { useState, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon, LockClosedIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import Swal from 'sweetalert2';

// Validação de senha
const validatePassword = (password: string) => ({
  minLength: password.length >= 8,
  hasUpperCase: /[A-Z]/.test(password),
  hasLowerCase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
});

// Component de requisitos de senha
const PasswordRequirements: React.FC<{ password: string }> = ({ password }) => {
  const requirements = validatePassword(password);
  const RequirementItem: React.FC<{ fulfilled: boolean; text: string }> = ({ fulfilled, text }) => (
    <li className={`flex items-center ${fulfilled ? 'text-green-600' : 'text-red-500'}`}>
      {fulfilled ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <XCircleIcon className="w-4 h-4 mr-2" />}
      {text}
    </li>
  );

  return (
    <ul className="text-sm mt-3 space-y-1 p-3 border border-gray-100 rounded-lg bg-white">
      <RequirementItem fulfilled={requirements.minLength} text="Mínimo 8 caracteres" />
      <RequirementItem fulfilled={requirements.hasUpperCase} text="Letra maiúscula" />
      <RequirementItem fulfilled={requirements.hasLowerCase} text="Letra minúscula" />
      <RequirementItem fulfilled={requirements.hasNumber} text="Número" />
      <RequirementItem fulfilled={requirements.hasSpecialChar} text="Caractere especial" />
    </ul>
  );
};

const SegurancaView: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const requirements = useMemo(() => validatePassword(newPassword), [newPassword]);
  const isPasswordStrong = Object.values(requirements).every(Boolean);
  const isButtonDisabled = loading || !isPasswordStrong || newPassword !== confirmPassword || !currentPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire('Erro', 'Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (newPassword.length > 0 && newPassword !== confirmPassword) {
      Swal.fire('Erro', 'A nova senha e a confirmação não coincidem.', 'error');
      return;
    }

    if (!isPasswordStrong) {
      Swal.fire('Erro', 'A nova senha não atende aos requisitos de segurança.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.');
      }

      Swal.fire('Sucesso', 'Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Swal.fire('Erro', err.message || 'Erro inesperado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-2">
      <div className="max-w-5xl w-full mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-xl border border-gray-100">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0c4a6e] flex items-center justify-center">
            <ShieldCheckIcon className="w-7 h-7 mr-2 text-blue-600" /> Segurança & Senha
          </h2>
          <p className="mt-2 text-sm text-[#2f6687]">
            Mantenha sua conta segura. Use uma senha forte e única.
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Coluna 1: Form de alteração de senha */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-[#0c4a6e] border-b pb-2 mb-4 flex items-center">
              <LockClosedIcon className="w-5 h-5 mr-2 text-blue-600" /> Alteração de Senha
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Senha Atual */}
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full border border-gray-100 rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Crie sua nova senha"
                    className="w-full border border-gray-100 rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordRequirements password={newPassword} />
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className={`w-full border rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] bg-gray-50
        ${confirmPassword.length > 0 && newPassword !== confirmPassword ? 'border-red-500' : 'border-gray-100'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                )}
              </div>

              {/* Botão */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isButtonDisabled}
                  className={`px-8 py-2 font-bold text-white rounded-lg transition duration-150
                    ${isButtonDisabled ? 'bg-[#0c4a6e]/50 cursor-not-allowed' : 'bg-[#0c4a6e] hover:bg-[#09415c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c4a6e]'}`}
                >
                  {loading ? 'Alterando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>

          {/* Coluna 2: Configurações de segurança */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-6 lg:pt-0">
            <h3 className="text-xl font-bold text-[#0c4a6e] border-b pb-2 mb-4 flex items-center">
              <DeviceTabletIcon className="w-5 h-5 mr-2 text-blue-600" /> Mais Segurança
            </h3>

            {/* 2FA */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Autenticação de Dois Fatores (2FA)</p>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {is2FAEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Adicione uma camada extra de proteção à sua conta.</p>
              <button
                onClick={() => setIs2FAEnabled(prev => !prev)}
                className={`w-full py-2 text-sm font-medium rounded-lg transition duration-150
                  ${is2FAEnabled ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {is2FAEnabled ? 'Desativar 2FA' : 'Configurar 2FA'}
              </button>
            </div>

            {/* Sessões Ativas */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="font-semibold text-gray-700 mb-2">Sessões Ativas</p>
              <p className="text-sm text-gray-600 mb-3">Encerre o acesso de todos os dispositivos, exceto o atual.</p>
              <button className="w-full py-2 text-sm font-medium rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 transition duration-150">
                Sair de todos os dispositivos
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SegurancaView;

'use client';
import React, { useRef, useState, useEffect } from 'react';
import { UserCircleIcon, KeyIcon, ArrowRightStartOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface HeaderAdminProps {
  toggleSidebar: () => void;
  setActiveView: (
    view: 'dashboard' | 'addFile' | 'addProperty' | 'perfil' | 'seguranca' | 'files' | 'properties' | 'chat'
  ) => void;
}

interface User {
  name: string;
  email: string;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ toggleSidebar, setActiveView }) => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserDropdownOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Puxando dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado');

        const res = await fetch(`${BASE_URL}/api/users/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Erro ao buscar usuário');
        }

        const data = await res.json();

        // Se não houver nome, pega a parte do e-mail antes do "@"
        if (!data.nome && data.email) {
          const nameFromEmail = data.email.split('@')[0];
          data.nome = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        }

        setUser({ name: data.nome, email: data.email });
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogoff = () => router.push('/');
  const goToSecurity = () => router.push('/esquecer-senha');

  const userInitials = user?.name?.charAt(0)?.toUpperCase() ?? '';

  return (
    <header className="bg-white h-20 px-4 md:px-6 flex items-center sticky top-0 z-40 border-b border-gray-100">
      <div className="flex items-center lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-[#e4e4e4] transition"
          aria-label="Abrir Menu Lateral"
        >
          <svg className="w-6 h-6 text-[#0a3b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">
      

        <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(prev => !prev)}
            className="flex items-center gap-4 p-2 rounded-full transition hover:bg-gray-100"
            aria-label="Menu do Usuário"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 ring-2 ring-gray-300">
              {userInitials}
            </div>
            <span className="hidden sm:block text-gray-800 font-medium">{user?.name ?? 'Carregando...'}</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition-transform duration-300 hidden sm:block ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 divide-y divide-gray-100">
              <div className="p-4 text-sm">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button onClick={() => { setUserDropdownOpen(false); setActiveView('perfil'); }} className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-gray-700">
                  <UserCircleIcon className="w-5 h-5 mr-3 text-gray-500" /> Perfil & Segurança
                </button>
              
              </div>
              <div className="py-1">
                <button onClick={handleLogoff} className="flex items-center w-full px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50">
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;

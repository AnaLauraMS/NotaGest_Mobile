"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../assets/LogoNotaGestLogin.png";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";

type Credentials = {
  email: string;
  senha: string;
};

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({ email: "", senha: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!credentials.email || !credentials.senha) {
      return alert("Preencha todos os campos!");
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          senha: credentials.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return alert(data.message || "Erro ao logar.");
      }

      localStorage.setItem("token", data.token);

      router.push("/uploads");
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro de conexão com o servidor.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔵 OVERLAY DE LOADING — aparece quando loading = true */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 font-['Plus_Jakarta_Sans',sans-serif]">

        {/* COLUNA ESQUERDA */}
        <div className="relative flex flex-col items-center justify-center bg-[#0c4a6e] overflow-hidden">
          <div className="absolute inset-0 bg-[#0c4a6e]">
            <div className="absolute inset-0 opacity-60 bg-[url('/hero/grid-01.svg')] bg-no-repeat bg-cover" />
          </div>

          <div className="relative z-10 text-center px-6">
            <Image
              src={Logo}
              alt="Logo NotaGest"
              width={400}
              height={100}
              className="mx-auto mb-4 drop-shadow-lg"
            />
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="flex flex-col justify-center px-6 py-12 bg-[#f9fbfd] relative">
          <div className="w-full max-w-md mx-auto">

            {/* Botão Voltar */}
            <div className="mb-6">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 text-sm text-[#0c4a6e] font-medium hover:opacity-80 transition"
              >
                <FaArrowLeft size={14} /> Voltar para Home
              </button>
            </div>

            {/* Título */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-800">Login</h1>
              <p className="text-sm text-gray-500 mt-2">
                Entre com seu e-mail e senha para acessar sua conta.
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo email */}
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                />
              </div>

              {/* Campo senha */}
              <div className="relative">
                <label htmlFor="senha" className="block mb-1 text-sm font-medium text-gray-700">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={credentials.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-500 hover:text-[#0c4a6e] transition"
                >
                  {showPassword ? (
                    <MdOutlineVisibility className="w-5 h-5" />
                  ) : (
                    <MdOutlineVisibilityOff className="w-5 h-5" />
                  )}
                </span>
              </div>

              {/* Opções */}
              <div className="flex items-center justify-between text-sm">
              
                <Link href="/forgot-password" className="underline text-[#0c4a6e] hover:text-[#25aff0]">
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de login */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300 
                  ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0c4a6e] hover:bg-[#08324b] hover:shadow-lg"
                  }`}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Não tem conta?{" "}
              <Link href="/register" className="text-[#0c4a6e] hover:text-[#25aff0]">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import Logo from "../../assets/LogoNotaGestLogin.png";
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const templateParams = {
      to_email: email,
      subject: "Recuperação de senha - NotaGest",
      message: `Olá! Você solicitou a redefinição da sua senha. Clique no link para redefinir: http://localhost:3000/reset-password`,
    };

    try {
      await emailjs.send(
        "service_id_aqui",   // Service ID
        "template_id_aqui",  // Template ID
        templateParams,
        "public_key_aqui"    // Public Key
      );

      alert("✅ E-mail de recuperação enviado com sucesso!");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("❌ Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* COLUNA ESQUERDA */}
      <div className="relative flex flex-col items-center justify-center bg-[#0c4a6e] overflow-hidden">
        {/* Fundo com grid */}
        <div className="absolute inset-0 bg-[#0c4a6e]">
          <div
            className="absolute inset-0 opacity-60 bg-[url('/hero/grid-01.svg')] bg-no-repeat bg-cover"
          />
        </div>

        {/* Logo */}
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
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 text-sm text-[#0c4a6e] font-medium hover:opacity-80 transition"
            >
              <FaArrowLeft size={14} /> Voltar para Home
            </button>
          </div>

          {/* Título */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Esqueceu sua senha?</h1>
            <p className="text-sm text-gray-500 mt-2">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
              />
            </div>

            {/* Botão enviar */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0c4a6e] hover:bg-[#08324b] hover:shadow-lg"
                }`}
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Lembrou a senha?{" "}
            <Link href="/login" className="text-[#0c4a6e] hover:text-[#25aff0]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

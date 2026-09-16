'use client';
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import Logo from "../../assets/LogoNotaGestLogin.png";
import { registerUser } from "../../utils/authService"; // ajuste o caminho conforme seu projeto

export default function Register() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // estado do modal
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validação de senhas
    if (formData.senha !== formData.confirmarSenha) {
      Swal.fire({ icon: "error", title: "Erro", text: "As senhas não correspondem." });
      return;
    }

    // Validação do aceite dos termos
    const aceitouTermos = (document.getElementById('aceite-contrato') as HTMLInputElement)?.checked;
    if (!aceitouTermos) {
      Swal.fire({ icon: "error", title: "Erro", text: "Você deve aceitar os termos para se cadastrar." });
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(formData.nome, formData.email, formData.senha);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: data.message || "Usuário criado com sucesso!",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({ nome: "", email: "", senha: "", confirmarSenha: "" });

      setTimeout(() => router.push("/login"), 2000);

    } catch (err: any) {
      console.error("Erro ao registrar:", err);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: err.message || "Erro desconhecido ao cadastrar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* COLUNA ESQUERDA */}
      <div className="relative flex flex-col items-center justify-center bg-[#0c4a6e] overflow-hidden">
        <div className="absolute inset-0 bg-[#0c4a6e]">
          <div className="absolute inset-0 opacity-70 bg-[url('/hero/grid-01.svg')] bg-no-repeat bg-cover" />
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
          <div className="mb-6">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-sm text-[#0c4a6e] font-medium hover:opacity-80 transition"
            >
              <FaArrowLeft size={14} /> Voltar para Home
            </button>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Cadastre-se</h1>
            <p className="text-sm text-gray-500 mt-2">
              Crie sua conta preenchendo os campos abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block mb-1 text-sm font-medium text-gray-700">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                id="nome"
                type="text"
                name="nome"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                required
              />
            </div>

            <div>
              <label htmlFor="senha" className="block mb-1 text-sm font-medium text-gray-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <input
                id="senha"
                type="password"
                name="senha"
                placeholder="Digite sua senha"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[ !@#$%^&*_=+-]).{6,12}$"
                title="A senha deve conter entre 6 a 12 caracteres, pelo menos uma letra maiúscula, um número e sem símbolos."
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block mb-1 text-sm font-medium text-gray-700">
                Confirmar senha <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmarSenha"
                type="password"
                name="confirmarSenha"
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25aff0]"
                required
              />
            </div>

            {/* Checkbox com modal */}
            <div className="flex items-center gap-2">
              <input
                id="aceite-contrato"
                type="checkbox"
                className="w-4 h-4 text-sky-600 border-gray-300 rounded"
                required
              />
              <label htmlFor="aceite-contrato" className="text-sm text-gray-600">
                Aceito os{" "}
                <span
                  className="text-blue-500 cursor-pointer underline"
                  onClick={() => setShowModal(true)}
                >
                  termos
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300 
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0c4a6e] hover:bg-[#08324b] hover:shadow-lg"
                }`}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Já tem conta?{" "}
            <Link href="/login" className="text-[#0c4a6e] hover:text-[#25aff0]">
              Fazer login
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL DOS TERMOS */}
      {showModal && (
  // Fundo transparente para destacar o modal
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
    {/* Conteúdo do Modal */}
    <div className="bg-white p-8 rounded-xl shadow-2xl w-11/12 max-w-xl transform transition-all duration-300 scale-100 opacity-100">
      
      {/* Título */}
      <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-2">Termos de Uso</h2>
      
      {/* Corpo do modal com scroll */}
      <div className="text-gray-700 text-sm max-h-80 overflow-y-auto pr-2 space-y-3">
        <p>
          Bem-vindo à plataforma NotaGest! Estes Termos de Uso estabelecem as regras e condições para a utilização de nossos serviços.
        </p>
        <p>
          Ao criar uma conta ou acessar nossos sistemas, você concorda em usar a plataforma de forma responsável, seguindo todas as leis aplicáveis e respeitando os direitos de terceiros.
        </p>
        <p>
          Você é responsável por manter a confidencialidade de sua senha e dados de login. Qualquer atividade realizada em sua conta é de sua inteira responsabilidade.
        </p>
        <p>
          Reservamo-nos o direito de atualizar estes termos a qualquer momento. Alterações serão comunicadas e seu uso continuado da plataforma constitui aceitação das novas regras.
        </p>
        <p>
          O uso indevido do sistema, tentativa de burlar funcionalidades ou violação de direitos autorais poderá resultar em bloqueio de acesso ou ações legais cabíveis.
        </p>
      </div>
      
      {/* Botão centralizado */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowModal(false)}
          className="px-6 py-2 bg-[#0c4a6e] text-white font-medium rounded-lg shadow-md hover:bg-[#08324b] focus:outline-none focus:ring-2 focus:ring-[#25aff0] focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Li e Aceito os Termos
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

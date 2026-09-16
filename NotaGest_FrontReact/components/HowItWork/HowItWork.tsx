import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; 
import {
  UserPlusIcon,
  DocumentArrowUpIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface StepData {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: StepData[] = [
  {
    number: 1,
    title: "Criação de Conta",
    description:
      "Inscreva-se em minutos fornecendo apenas nome, e-mail e senha.",
    icon: UserPlusIcon,
  },
  {
    number: 2,
    title: "Upload de Documentos",
    description:
      "Envie fotos, PDFs e comprovantes diretamente do seu computador ou celular.",
    icon: DocumentArrowUpIcon,
  },
  {
    number: 3,
    title: "Organize e Categorize",
    description:
      "Classifique seus arquivos por categorias, datas ou tipo de documento.",
    icon: Squares2X2Icon,
  },
  {
    number: 4,
    title: "Controle Total",
    description:
      "Gerencie seus arquivos com segurança, praticidade e uma interface intuitiva.",
    icon: ShieldCheckIcon,
  },
];

const HowItWork: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }); // inicializa o AOS
  }, []);

  return (
    <section
      id="how-it-work-section"
      className="relative py-16 px-6 bg-white overflow-hidden mb-15"
    >
      {/* Linha sutil no fundo */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0c4a6e]/20 to-transparent hidden lg:block" />

      <div className="max-w-6xl mx-auto text-center font-[Plus Jakarta Sans]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Como Funciona
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto mb-20">
          Em poucos passos, você terá <strong>controle total</strong> sobre seus
          documentos fiscais. Veja como é simples começar:
        </p>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-20 lg:gap-10 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center max-w-xs"
                data-aos="fade-up"
                data-aos-delay={index * 200} // efeito escalonado
              >
                {/* Ícone */}
                <div className="relative mb-6">
                  <div className="relative bg-[#0c4a6e] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg ring-4 ring-[#25aff0]/30">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>

                {/* Número */}
                <div className="text-[#0c4a6e] font-extrabold text-xl mb-2">
                  Passo {step.number}
                </div>

                {/* Texto */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWork;

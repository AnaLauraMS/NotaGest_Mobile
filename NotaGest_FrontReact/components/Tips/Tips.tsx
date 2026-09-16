import React, { useEffect } from "react";
import AOS from "aos";
import { FaArrowRight } from "react-icons/fa";
import "aos/dist/aos.css";
import {
  FaTools,
  FaFileInvoiceDollar,
  FaClipboardList,
} from "react-icons/fa";

const Tips = () => {
  const tipsData = [
    {
      title: "Mão de Obra e Serviços Terceirizados",
      description:
        "Não se esqueça de arquivar recibos e notas de serviços prestados na obra. Isso ajudará na dedução do seu Imposto de Renda.",
      link: "https://avt.com.br/construcao-de-casas-documentacao-necessaria/",
      icon: <FaTools />,
    },
    {
      title: "Simplifique a Declaração do Imposto de Renda",
      description:
        "Ao manter todos os comprovantes organizados, a declaração do Imposto de Renda se torna mais simples e eficiente.",
      link: "https://einvestidor.estadao.com.br/educacao-financeira/imposto-de-renda-2024-documentos-necessarios-declaracao/",
      icon: <FaFileInvoiceDollar />,
    },
    {
      title: "Saiba Quais Documentos São Obrigatórios",
      description:
        "Não sabe quais documentos guardar? Tenha em mãos tudo o que for necessário para comprovar seus gastos na construção do imóvel.",
      link: "https://investnews.com.br/guias/imposto-de-renda-o-que-e/",
      icon: <FaClipboardList />,
    },
  ];

  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section
      id="tips"
      className="
        py-16 
        px-6 sm:px-10 md:px-20 lg:px-32 
        bg-gradient-to-b from-white via-gray-50 to-white
      "
    >
      <div className="max-w-6xl mx-auto text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Dicas Essenciais
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Organize melhor seus comprovantes e torne sua declaração do imposto de
          renda muito mais simples e segura.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        {tipsData.map((tip, index) => (
          <div
            key={index}
            className="
              bg-white rounded-3xl shadow-md hover:shadow-xl 
              transition-all duration-300 p-8 
              flex flex-col items-center text-center 
              border border-gray-100 relative
            "
          >
            {/* Ícone */}
            <div className="
              bg-gradient-to-r from-[#059669] to-[#047857] 
              rounded-full w-20 h-20 
              flex items-center justify-center 
              mb-6 shadow-lg 
              -mt-12
            ">
              {React.cloneElement(tip.icon, {
                size: 32,
                className: "text-white",
              })}
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col flex-1 justify-between items-center w-full">
              <div className="w-full">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  {tip.description}
                </p>
              </div>

              {/* Link */}
              <a
                href={tip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center 
                  text-[#059669] font-medium 
                  text-sm md:text-base hover:underline
                "
              >
                Saiba Mais <FaArrowRight className="ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Tips;

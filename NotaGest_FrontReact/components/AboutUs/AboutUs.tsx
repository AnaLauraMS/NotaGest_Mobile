"use client";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaCloud, FaLeaf, FaLock, FaTools } from "react-icons/fa";

const AboutUs: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-[#0c4a6e] text-white py-20 px-6 md:px-12 lg:px-24"
      id="about-us-section"
    >
      {/* Fundo decorativo sutil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#ffffff33,_transparent_70%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto font-sans space-y-12">
        {/* Cabeçalho + Ícones centralizados */}
        <div data-aos="fade-up" className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Sobre Nós
          </h2>
          <p className="text-gray-200 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            Transformamos a gestão documental no setor da construção,
            digitalizando processos e reduzindo o uso de papel com soluções
            seguras e sustentáveis.
          </p>

          {/* Ícones centralizados e sem texto */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="flex justify-center gap-8 text-[#4ade80] text-3xl mt-6"
          >
            <FaCloud title="Armazenamento em Nuvem" />
            <FaTools title="Construção Civil" />
            <FaLeaf title="Sustentabilidade" />
            <FaLock title="Segurança dos Documentos" />
          </div>
        </div>

        {/* Seção Missão / Visão / Valores */}
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="grid md:grid-cols-2 gap-12 items-start"
        >
          {/* Texto principal */}
          <div className="space-y-5 text-gray-100 leading-relaxed text-base md:text-lg">
            <p>
              O <strong>NotaGest</strong> nasceu com o propósito de transformar
              a forma como documentos são organizados no setor da construção.
              Nossa plataforma digitaliza comprovantes, notas fiscais e recibos,
              reduzindo burocracias e contribuindo para um futuro mais verde.
            </p>

            <p>
              Desenvolvemos uma experiência simples e intuitiva, permitindo que
              profissionais e proprietários de imóveis acessem e gerenciem seus
              documentos de forma ágil e segura — de qualquer lugar e a qualquer
              momento.
            </p>

            <p>
              Acreditamos que tecnologia e sustentabilidade caminham lado a
              lado, promovendo eficiência, transparência e responsabilidade
              ambiental.
            </p>
          </div>

          {/* Missão, Visão e Valores */}
          <div className="space-y-8 border-l border-white/20 pl-8">
            <div>
              <h3 className="text-[#4ade80] text-lg font-semibold mb-2">
                Missão
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                Digitalizar a gestão de documentos da construção civil,
                promovendo agilidade, sustentabilidade e segurança na
                organização de dados.
              </p>
            </div>

            <div>
              <h3 className="text-[#4ade80] text-lg font-semibold mb-2">
                Visão
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                Ser referência em soluções tecnológicas que simplificam
                processos e reduzem o impacto ambiental no setor da construção.
              </p>
            </div>

            <div>
              <h3 className="text-[#4ade80] text-lg font-semibold mb-2">
                Valores
              </h3>
              <ul className="text-gray-200 list-disc list-inside text-base space-y-1">
                <li>Transparência e confiabilidade</li>
                <li>Inovação com propósito</li>
                <li>Sustentabilidade e responsabilidade digital</li>
                <li>Eficiência e simplicidade</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

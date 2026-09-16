"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Aos from "aos";
import "aos/dist/aos.css";

import juliano from "../../assets/photo_01.png";
import roberto from "../../assets/photo_2.png";
import mariana from "../../assets/photo_3.png";
import aspas_escura from "../../assets/aspas_escura.png";
import aspas_clara from "../../assets/aspas_clara.png";

const ClientComments: React.FC = () => {
  useEffect(() => {
    Aos.init({ duration: 800, once: true });
  }, []);

  const comments = [
    {
      image: juliano,
      quoteImage: aspas_escura,
      text: "Com o sistema, consegui organizar toda a documentação da obra de forma prática e rápida. Agora, encontrar comprovantes e notas fiscais é muito mais simples. Foi uma ótima escolha!",
      name: "Juliano Souza",
      role: "Engenheiro Civil",
      bgColor: "bg-[#f9fafb] ",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
    },
    {
      image: roberto,
      quoteImage: aspas_clara,
      text: "Nunca foi tão fácil gerenciar os documentos das construções que administro. O sistema não só economizou tempo, mas também eliminou o risco de perder arquivos importantes.",
      name: "Roberto Lima",
      role: "Arquiteto",
      bgColor: "bg-[#059669]",
      textColor: "text-white",
      borderColor: "border-white/40",
    },
    {
      image: mariana,
      quoteImage: aspas_clara,
      text: "Eu costumava perder horas tentando localizar recibos e comprovantes. Esse sistema mudou tudo! Agora, tenho todos os documentos organizados e prontos para a declaração de imposto de renda.",
      name: "Mariana Alves",
      role: "Proprietária de Imóveis",
      bgColor: "bg-[#059669]",
      textColor: "text-white",
      borderColor: "border-white/40",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-white mt-11">

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center ">
        {comments.map((comment, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
           className={`flex-1 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between ${comment.bgColor}`}
          >
            {/* Aspas */}
            <div className="w-8 h-8 md:w-10 md:h-10">
              <Image src={comment.quoteImage} alt="Aspas" className="object-contain" />
            </div>

            {/* Texto */}
            <p
              className={`mt-4 mb-6 min-h-[140px] md:min-h-[120px] ${comment.textColor} text-sm md:text-base leading-relaxed`}
            >
              {comment.text}
            </p>

            {/* Separador */}
            <hr className={`border ${comment.borderColor} mb-4 w-3/4 mx-auto`} />

            {/* Autor */}
            <div className="flex items-center mt-auto">
              <Image
                src={comment.image}
                alt={comment.name}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div className="flex flex-col">
                <span className={`font-semibold ${comment.textColor}`}>{comment.name}</span>
                <span className={`text-sm ${comment.textColor} opacity-80`}>{comment.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClientComments;

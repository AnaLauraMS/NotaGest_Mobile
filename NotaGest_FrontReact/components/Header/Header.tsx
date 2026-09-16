"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Logo from "../../assets/LogoHorizontal.png";
import { Contrast } from "lucide-react";


const HeaderHero: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const handleScroll = () => setSticky(window.scrollY > 80);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* HEADER FIXO */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${sticky ? "bg-[#0c4a6e] shadow-lg" : "bg-transparent"
          }`}
      >
        <div className="flex items-center justify-between h-30 px-4 sm:px-2 md:px-2 mx-auto max-w-6xl gap-2.5">
          <div className="flex items-center gap-2 ml-1">
            {/* Aumentar Fonte */}
            <button
              onClick={() => {
                document.body.style.fontSize =
                  (parseFloat(getComputedStyle(document.body).fontSize) + 1) + "px";
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition shadow-md"
            >
              <span className="text-lg font-bold">A+</span>
            </button>

            {/* Diminuir Fonte */}
            <button
              onClick={() => {
                document.body.style.fontSize =
                  (parseFloat(getComputedStyle(document.body).fontSize) - 1) + "px";
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition shadow-md"
            >
              <span className="text-lg font-bold">A-</span>
            </button>

            {/* Alto Contraste */}
            <button
              onClick={() => {
                document.body.classList.toggle("high-contrast");
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition shadow-md"
            >
              <Contrast size={20} />
            </button>
          </div>
          <Image src={Logo} alt="Logo" className="h-10 w-auto" priority />

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex ">
            <ul className="flex items-center gap-6 text-white">
              {[{ label: "Home", to: "home" },
              { label: "Dicas", to: "tips" },
              { label: "Como Funciona", to: "how-it-work-section" },
              { label: "Sobre Nós", to: "about-us-section" },
              { label: "FAQ", to: "faq-section" }].map((item) => (
                <li key={item.to} className="cursor-pointer hover:text-[#fde047] transition">
                  <ScrollLink to={item.to} smooth duration={500}>
                    {item.label}
                  </ScrollLink>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="border border-[#25aff0] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#25aff0]/10 transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="bg-[#25aff0] text-black py-2 px-4 rounded-md font-semibold hover:opacity-80 transition"
                >
                  Cadastre-se
                </Link>
              </li>
            </ul>
          </nav>

          {/* BOTÃO MOBILE */}
          <button
            className="md:hidden text-white z-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MENU MOBILE */}
        {isOpen && (
          <div className="md:hidden bg-[#0c4a6e] px-6 pb-6 shadow-lg animate-slide-down">
            <ul className="flex flex-col gap-4 text-white">
              {[{ label: "Home", to: "home" },
              { label: "Dicas", to: "tips" },
              { label: "Como Funciona", to: "how-it-work-section" },
              { label: "Sobre Nós", to: "about-us-section" },
              { label: "FAQ", to: "faq-section" }].map((item) => (
                <li key={item.to} className="cursor-pointer hover:text-[#fde047] transition">
                  <ScrollLink
                    to={item.to}
                    smooth
                    duration={500}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </ScrollLink>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="block text-center bg-[#fde047] text-black py-2 px-4 rounded-md hover:opacity-80"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="block text-center bg-[#25aff0] text-black py-2 px-4 rounded-md hover:opacity-80"
                  onClick={() => setIsOpen(false)}
                >
                  Cadastre-se
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-10 min-h-screen pt-20 pb-16 md:pt-0 md:pb-0 relative overflow-hidden"
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0c4a6e] to-[#022c3c]" />
        <div
          className="absolute inset-0 -z-10 opacity-30 bg-[url('/hero/grid-01.svg')] bg-no-repeat bg-cover"
        />

        {/* TEXTO HERO */}
        <div className="w-full md:w-1/2 text-center md:text-left text-white space-y-5 flex flex-col justify-center h-full ml-14 mr-14">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold leading-snug mt-20 md:leading-tight">
            Gerencie seus{" "}
            <span className="text-[#25aff0]">Cupons Fiscais</span> de Forma{" "}
            <span className="text-[#25aff0]">Rápida</span> e{" "}
            <span className="text-[#25aff0]">Segura</span>
          </h1>

          <p className="text-base sm:text-md md:text-lg text-gray-200 mt-5 ">
            A maneira mais prática e profissional de controlar seus documentos fiscais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-[#25aff0] text-black py-3 px-6 rounded-md font-semibold hover:opacity-80 transition"
            >
              Experimente grátis
            </Link>
          </div>
        </div>

        {/* IMAGEM HERO */}
        <div className="hidden md:flex w-full md:w-1/2 flex-1 mt-10 md:mt-0 justify-center items-center">
          <div className="relative w-full h-[400px] md:h-[600px] lg:h-[60vh] max-w-[50rem]">
            <div className="absolute w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <Image
              src={require("../../assets/Img_Home.png")}
              alt="Imagem Hero"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

      </section>
    </div>
  );
};

export default HeaderHero;

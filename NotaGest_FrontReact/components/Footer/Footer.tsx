import React from 'react';
import Image from 'next/image';
import Logo from '../../assets/LogoHorizontal.png';
import { FaInstagram, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-[#0b3a57] text-gray-100 px-6 py-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center">

        {/* Seção 1: Logo e texto institucional */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <Image
            src={Logo}
            alt="Logo Farj-Br"
            width={160}
            height={80}
            className="mb-2"
            priority
          />
          <p className="text-sm leading-relaxed max-w-xs text-gray-300">
            Simplifique sua gestão documental, proteja o meio ambiente e organize seu futuro. 
            Juntos, rumo a um amanhã mais sustentável.
          </p>
        </div>

        {/* Seção 2: Redes sociais */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <h3 className="text-lg font-semibold tracking-wide">Conecte-se</h3>
          <div className="flex space-x-6">
            <a href="#" aria-label="Instagram" className="hover:scale-110 transition-transform duration-300">
              <FaInstagram className="text-2xl hover:text-[#E1306C] transition-colors duration-300" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:scale-110 transition-transform duration-300">
              <FaFacebook className="text-2xl hover:text-[#1877F2] transition-colors duration-300" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:scale-110 transition-transform duration-300">
              <FaTwitter className="text-2xl hover:text-[#1DA1F2] transition-colors duration-300" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:scale-110 transition-transform duration-300">
              <FaLinkedin className="text-2xl hover:text-[#0077B5] transition-colors duration-300" />
            </a>
            <a href="mailto:contato@farjbr.com" aria-label="Email" className="hover:scale-110 transition-transform duration-300">
              <MdEmail className="text-2xl hover:text-[#D44638] transition-colors duration-300" />
            </a>
          </div>
        </div>

        {/* Seção 3: Missão */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-3">
          <h3 className="text-lg font-semibold tracking-wide">Nossa missão</h3>
          <p className="text-sm leading-relaxed max-w-xs text-gray-300">
            Promover a sustentabilidade por meio da digitalização de documentos 
            e incentivar práticas conscientes na construção civil e no dia a dia.
          </p>
        </div>
      </div>

      {/* Linha divisória */}
      <div className="border-t border-gray-600 mt-10 pt-6 text-center">
        <p className="text-sm font-medium text-gray-300">© 2024 Farj-Br</p>
        <p className="text-xs text-gray-400 mt-1">Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

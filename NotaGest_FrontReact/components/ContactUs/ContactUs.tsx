"use client";
import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const ContactUs: React.FC = () => {
    const PRIMARY_BLUE = '#0c4a6e';
    const ACCENT_GREEN = '#4ade80';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [messageStatus, setMessageStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessageStatus('idle');

        console.log('Dados enviados:', formData);

        setTimeout(() => {
            setMessageStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        }, 1000);
    };

    return (
        <section className="py-5 px-6 md:px-12 lg:px-24 bg-white mb-11" id="contact-us">
            <div className="max-w-6xl mx-auto">
                {/* Título padronizado */}
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
                    Fale Conosco
                </h2>
                <p className="text-base md:text-lg text-center mb-12 text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Entre em contato com nossa equipe para dúvidas, demonstrações ou suporte técnico.
                </p>

                {/* Container principal */}
                <div className="flex flex-col lg:flex-row shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                    
                    {/* Coluna 1 */}
                    <div 
                        className="lg:w-1/3 p-8 md:p-10 text-white flex flex-col justify-center"
                        style={{ backgroundColor: PRIMARY_BLUE }}
                    >
                        <h3 className="text-2xl font-semibold mb-4">Estamos à disposição</h3>
                        <p className="mb-8 text-white/80 text-sm leading-relaxed">
                            Preencha o formulário ou utilize um dos canais abaixo para falar diretamente com nosso time.
                        </p>

                        <div className="space-y-5 text-sm sm:text-base">
                            <div className="flex items-center space-x-3">
                                <EnvelopeIcon className="w-5 h-5 text-white" />
                                <span>contato@notagest.com</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <PhoneIcon className="w-5 h-5 text-white" />
                                <span>+55 11 98765-4321</span>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                                <span>Rua da Inovação, 123 - Sala 404, São Paulo, SP</span>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2 */}
                    <div className="lg:w-2/3 p-8 md:p-10 bg-white">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {messageStatus === 'success' && (
                                <div className="p-3 rounded-lg text-sm text-green-800 bg-green-100 border border-green-300">
                                    Mensagem enviada com sucesso! Em breve, entraremos em contato.
                                </div>
                            )}
                            {messageStatus === 'error' && (
                                <div className="p-3 rounded-lg text-sm text-red-800 bg-red-100 border border-red-300">
                                    Erro ao enviar. Por favor, tente novamente mais tarde.
                                </div>
                            )}

                            {/* Campos */}
                            <input
                                type="text"
                                name="name"
                                placeholder="Nome Completo"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25aff0] transition duration-200 placeholder-gray-500"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25aff0] transition duration-200 placeholder-gray-500"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Telefone/WhatsApp"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25aff0] transition duration-200 placeholder-gray-500"
                                />
                            </div>

                            <textarea
                                name="message"
                                placeholder="Sua Mensagem ou Dúvida"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25aff0] transition duration-200 placeholder-gray-500"
                            />

                            {/* Botão estilizado com ícone */}
                            <button 
                                type="submit"
                                className="w-full py-3 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                                style={{ backgroundColor: PRIMARY_BLUE }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_GREEN)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_BLUE)}
                            >
                                Enviar Mensagem
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;

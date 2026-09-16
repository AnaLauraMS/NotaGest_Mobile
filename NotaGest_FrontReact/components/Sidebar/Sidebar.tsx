'use client';

import React, { useState } from 'react';
import packageJson from '../../package.json';
import {
    HomeIcon,
    FolderIcon,
    ChartBarIcon,
    ChevronDownIcon,
    DocumentPlusIcon,
    BuildingOfficeIcon,
    DocumentArrowDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
    activeView: any;
    setActiveView: (view: any) => void;
    handleListFiles: () => void;
    handleListProperties: () => void;
    generatePDF: () => void;
    exportExcel: () => void;
    isSidebarOpen: boolean; // Controle mobile
    toggleSidebar: () => void; // Toggle mobile
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
    handleListFiles,
    generatePDF,
    exportExcel,
    isSidebarOpen,
    handleListProperties,
    toggleSidebar,
    isCollapsed,
    setIsCollapsed
}) => {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        setOpenSection(null); // Fecha submenus ao recolher
    };

    const handleClickLink = (view: any, action?: () => void) => {
        setActiveView(view);
        if (action) action();
        if (typeof window !== "undefined" && window.innerWidth < 1024) toggleSidebar();
    };

    const subLinkClass = "w-full text-left text-sm py-2 px-4 rounded-lg transition-colors text-gray-500 hover:text-blue-600 hover:bg-blue-50/50";

    const SimpleLink = ({ Icon, title, view }: { Icon: any, title: string, view: string }) => (
        <button
            onClick={() => handleClickLink(view)}
            className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                ${activeView === view ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? title : ''}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${activeView === view ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            {!isCollapsed && <span className="ml-3 font-medium">{title}</span>}
        </button>
    );

    const LinkItem = ({ Icon, title, section }: { Icon: any, title: string, section: string }) => (
        <button
            onClick={() => isCollapsed ? setIsCollapsed(false) : setOpenSection(openSection === section ? null : section)}
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group
                ${openSection === section ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
            <div className="flex items-center">
                <Icon className={`w-5 h-5 flex-shrink-0 ${openSection === section ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {!isCollapsed && <span className="ml-3 font-medium">{title}</span>}
            </div>
            {!isCollapsed && (
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openSection === section ? 'rotate-180 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            )}
        </button>
    );

    return (
        <>
            <aside
                className={`
                    fixed top-0 left-0 h-screen bg-white border-r border-gray-100
                    transition-all duration-300 ease-in-out z-[100]
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 lg:static flex flex-col
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Botão de Recolher (Desktop) */}
                <button 
                    onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-[110]"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                </button>

                {/* Logo */}
                <div className={`flex items-center h-20 shrink-0 px-6 border-b border-gray-100 mb-2 bg-white ${isCollapsed ? 'justify-center px-0' : ''}`}>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    {!isCollapsed && <span className="ml-3 text-xl font-bold text-gray-800 truncate">Notagest</span>}
                </div>

                <nav className="space-y-2 pt-2 px-4 flex-1 overflow-y-auto custom-scrollbar">
                    <SimpleLink Icon={HomeIcon} title="Dashboard" view="dashboard" />
                    <SimpleLink Icon={SparklesIcon} title="Chat IA" view="chat" />

                    {/* Gestão de Arquivos */}
                    <div>
                        <LinkItem Icon={FolderIcon} title="Arquivos" section="arquivos" />
                        {!isCollapsed && openSection === 'arquivos' && (
                            <div className="ml-4 pt-1 space-y-1">
                                <button
                                    onClick={() => handleClickLink('files', handleListFiles)}
                                    className={`${subLinkClass} flex items-center`}
                                >
                                    <span className="w-1 h-1 rounded-full mr-3 bg-blue-500"></span>
                                    Listar Arquivos
                                </button>
                                <button
                                    onClick={() => handleClickLink('addFile')}
                                    className={`${subLinkClass} flex items-center`}
                                >
                                    <DocumentPlusIcon className="w-4 h-4 mr-3 text-gray-500" />
                                    Adicionar Nota
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gestão de Imóveis */}
                    <div>
                        <LinkItem Icon={BuildingOfficeIcon} title="Imóveis" section="imoveis" />
                        {!isCollapsed && openSection === 'imoveis' && (
                            <div className="ml-4 pt-1 space-y-1">
                                <button
                                    onClick={() => handleClickLink('properties', handleListProperties)}
                                    className={`${subLinkClass} flex items-center`}
                                >
                                    <span className="w-1 h-1 rounded-full mr-3 bg-blue-500"></span>
                                    Listar Imóveis
                                </button>
                                <button
                                    onClick={() => handleClickLink('addProperty')}
                                    className={`${subLinkClass} flex items-center`}
                                >
                                    <DocumentPlusIcon className="w-4 h-4 mr-3 text-gray-500" />
                                    Cadastrar Imóvel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Relatórios */}
                    <div>
                        <LinkItem Icon={ChartBarIcon} title="Relatórios" section="relatorios" />
                        {!isCollapsed && openSection === 'relatorios' && (
                            <div className="ml-4 pt-1 space-y-1">
                                <button 
                                    onClick={generatePDF} 
                                    className="flex items-center w-full text-sm py-2 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4 mr-3" /> Exportar PDF
                                </button>
                                <button 
                                    onClick={exportExcel} 
                                    className="flex items-center w-full text-sm py-2 px-4 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4 mr-3" /> Exportar Excel
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="w-full px-4 border-t border-gray-100 py-4 shrink-0 bg-white">
                    {!isCollapsed ? (
                        <p className="text-xs text-gray-400 text-center">v{packageJson.version || '1.4.0'} - Notagest</p>
                    ) : (
                        <p className="text-[10px] text-gray-400 text-center font-bold">v{(packageJson.version || '1.4.0').split('.').slice(0, 2).join('.')}</p>
                    )}
                </div>
            </aside>

            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default Sidebar;
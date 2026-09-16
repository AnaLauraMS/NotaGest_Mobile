'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import HeaderAdmin from '../../components/HeaderAdmin/HeaderAdmin';
import Sidebar from '../../components/Sidebar/Sidebar';
import AddFileView from '../../components/AddFileView/AddFileView';
import AddPropertyView from '../../components/AddPropertyView/AddPropertyView';
import dynamic from "next/dynamic";
import FileList from '../../components/FileList/FileList';
import PropertyList from '../../components/PropertyList/PropertyList';
import ArquivoNaoEncontrado from '/assets/arquivo_nao_encontrado.jpg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SegurancaView from '../../components/SegurancaView/SegurancaView';
import PerfilView from '../../components/PerfilView/PerfilView';
import ChatView from '../../components/ChatView/ChatView';

const Graphics = dynamic(() => import("../../components/Graphics/Graphics"), { ssr: false });


export interface FileData {
  _id: string;
  title: string;
  value: number;
  purchaseDate: string;
  property: string | { _id: string; nome: string }; 
  category: string;
  subcategory: string;
  filePath: string;
}

export interface PropertyDataForUI {
  _id: string;
  nome: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo?: string;
  cep?: string;
}

type View =
  | 'dashboard'
  | 'addFile'
  | 'addProperty'
  | 'perfil'
  | 'seguranca'
  | 'chat'
  | 'files'
  | 'properties';

const UploadsPage = () => {
  const router = useRouter();

  const [files, setFiles] = useState<FileData[]>([]);
  const [properties, setProperties] = useState<PropertyDataForUI[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => {
    fetchFiles();
  }, []);

  /* -------------------------
      FETCH FILES - SEM ALTERAR O BACK
  --------------------------*/
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/uploads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Erro ao buscar arquivos');

      const data = await response.json();
      setFiles(data);

    } catch (error) {
      console.error('Erro ao buscar arquivos', error);
    }
  };

  /* -------------------------
      LISTAR IMÓVEIS
  --------------------------*/
  const handleListProperties = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/imoveis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Erro ao buscar imóveis');

      const data = await response.json();

      const formatted = data.map((p: any) => ({
        _id: String(p._id),
        nome: p.nome || p.name || 'Sem nome',
        rua: p.rua || '',
        numero: p.numero || '',
        bairro: p.bairro || '',
        cidade: p.cidade || '',
        estado: p.estado || '',
        tipo: p.tipo || '',
        cep: p.cep || ''
      }));

      setProperties(formatted);
      setActiveView('properties');

    } catch (error) {
      console.error('Erro ao listar imóveis', error);
    }
  };

  /* -------------------------
      LISTAR ARQUIVOS
  --------------------------*/
  const handleListFiles = async () => {
    await fetchFiles();
    setActiveView('files');
  };

  /* -------------------------
      DELETE FILE 
  --------------------------*/
  const deleteFile = (_id: string) =>
    setFiles(prev => prev.filter(f => f._id !== _id));

  /* -------------------------
      ADD FILE (COMPATÍVEL COM AddFileView)
  --------------------------*/
  const addFile = (file: any) =>
    setFiles(prev => [...prev, file]);

  const addProperty = (msg: string) => console.log(msg);

  /* -------------------------
      GERAR PDF
  --------------------------*/
  const generatePDF = () => {
  if (files.length === 0) return alert("Nenhum arquivo para gerar PDF!");

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Relatório de Arquivos', 14, 15);

  const rows = files.map(file => {
    // Corrigir o imóvel (property)
    const propertyName =
      typeof file.property === "object"
        ? file.property.nome
        : file.property;

    // Corrigir data
    const formattedDate = file.purchaseDate
      ? new Date(file.purchaseDate).toLocaleDateString('pt-BR')
      : '';

    return [
      file.title,
      `R$ ${file.value.toFixed(2)}`,
      formattedDate,
      propertyName,
      file.category,
      file.subcategory
    ];
  });

  autoTable(doc, {
    startY: 25,
    head: [['Título', 'Valor', 'Data da Compra', 'Imóvel', 'Categoria', 'Subcategoria']],
    body: rows,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [8, 47, 73], textColor: [255, 255, 255] },
  });

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url);
};

  /* -------------------------
      EXPORTAR EXCEL
  --------------------------*/
  const exportExcel = () => {
    if (files.length === 0) return alert("Nenhum arquivo para exportar!");

    const ws = XLSX.utils.json_to_sheet(files.map(f => ({
      Título: f.title,
      Valor: f.value.toFixed(2),
      'Data da Compra': f.purchaseDate,
      Imóvel: f.property,
      Categoria: f.category,
      Subcategoria: f.subcategory
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Arquivos");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Relatorio_Arquivos.xlsx");
  };

  /* -------------------------
      RENDER
  --------------------------*/
  return (
    <div className="h-screen w-full bg-gray-50 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative">
      {/* Sidebar takes full height on the left */}
      <Sidebar
        activeView={activeView}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        setActiveView={setActiveView}
        handleListFiles={handleListFiles}
        handleListProperties={handleListProperties}
        generatePDF={generatePDF}
        exportExcel={exportExcel}
      />

      {/* Right Column containing Header and Main Area */}
      <div className={`flex flex-col h-full fully-contained w-full transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <HeaderAdmin toggleSidebar={toggleSidebar} setActiveView={setActiveView} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">

          {activeView === 'dashboard' && <Graphics files={files} />}

          {activeView === 'files' && (
            files.length === 0 ?
              (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Image src={ArquivoNaoEncontrado} alt="Nenhum arquivo" width={160} height={160} />
                  <h2 className="text-lg font-semibold text-gray-700 mt-4">Nenhum arquivo encontrado</h2>
                </div>
              ) : (
                <FileList files={files} deleteFile={deleteFile} />
              )
          )}

          {activeView === 'properties' && (
            properties.length === 0 ?
              (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Image src={ArquivoNaoEncontrado} alt="Nenhum imóvel" width={160} height={160} />
                  <h2 className="text-lg font-semibold text-gray-700 mt-4">Nenhum imóvel encontrado</h2>
                </div>
              ) : (
                <PropertyList
                  properties={properties}
                  deleteProperty={(_id) => setProperties(prev => prev.filter(p => p._id !== _id))}
                />
              )
          )}

          {activeView === 'addFile' && <AddFileView onAddFile={addFile} />}
          {activeView === 'addProperty' && <AddPropertyView onAddProperty={addProperty} />}
          {activeView === 'chat' && <ChatView />}
          {activeView === 'perfil' && <PerfilView />}
          {activeView === 'seguranca' && <SegurancaView />}
        </main>
      </div>
    </div>
  );
};

export default UploadsPage;

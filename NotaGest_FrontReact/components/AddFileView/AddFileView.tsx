'use client';
import axios from 'axios';
import { IoMdCloudUpload } from "react-icons/io";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export interface FileData {
    id: number;
    name: string;
    title: string;
    value: number;
    purchaseDate: string;
    observation?: string;
    category: string;
    subcategory: string;
    property: string;
    date?: string;
    size?: string;
    url?: string;
}

interface AddFileViewProps {
    onAddFile: (file: FileData) => void;
}

const AddFileView: React.FC<AddFileViewProps> = ({ onAddFile }) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [observation, setObservation] = useState('');
    const [category, setCategory] = useState('Construção');
    const [subcategory, setSubcategory] = useState('Iluminação');
    const [property, setProperty] = useState('');
    const [uploading, setUploading] = useState(false);
    const [properties, setProperties] = useState<{ id: string; nome: string }[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiFilePath, setAiFilePath] = useState<string | null>(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const subcategories = ['Iluminação', 'Ferragem', 'Hidráulica', 'Acabamento', 'Pintura', 'Madeiramento', 'Outros'];

    // 🔹 Buscar imóveis do usuário logado
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn('⚠️ Token não encontrado.');
                    return;
                }

                const response = await axios.get(`${BASE_URL}/api/imoveis/nome`, {
                    headers: { Authorization: `Bearer ${token}` }
                });


                if (Array.isArray(response.data) && response.data.length > 0) {
                    const lista = response.data.map((imovel: any) => ({
                        id: imovel._id || imovel.id,
                        nome: imovel.nome || imovel.name || 'Sem nome'
                    }));
                    setProperties(lista);
                } else {
                    console.warn('Nenhum imóvel encontrado para este usuário.');
                }
            } catch (error) {
                console.error('❌ Erro ao buscar imóveis:', error);
            }
        };

        fetchProperties();
    }, [BASE_URL]);

    // 🔹 Envio e salvamento do arquivo + dados
    const handleSubmit = async () => {
        if (!file || !property) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Selecione um arquivo e um imóvel antes de continuar.',
                confirmButtonColor: '#0c4a6e'
            });
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Token não encontrado',
                    text: 'Faça login novamente para continuar.',
                    confirmButtonColor: '#0c4a6e'
                });
                return;
            }

            // 1️⃣ Enviar o arquivo para o backend (Reaproveita upload feito pela IA se houver)
            let filePath = aiFilePath;

            if (!filePath) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await axios.post(`${BASE_URL}/api/uploadfile`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                filePath = uploadResponse.data.filePath;
            }

            // 2️⃣ Montar o objeto com todos os dados esperados pelo backend
            const newFile = {
                title,
                value: parseFloat(value),
                purchaseDate,
                observation,
                category,
                subcategory,
                property,
                filePath
            };

            // 3️⃣ Salvar os metadados no banco
            await axios.post(`${BASE_URL}/api/uploads`, newFile, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 4️⃣ Atualizar o estado local
            onAddFile({
                id: Date.now(),
                name: file.name,
                title,
                value: parseFloat(value),
                purchaseDate,
                observation,
                category,
                subcategory,
                property,
                date: new Date().toLocaleDateString(),
                size: `${(file.size / 1024).toFixed(2)} KB`,
                url: filePath ?? undefined
            });

            // 5️⃣ Limpar formulário
            setFile(null);
            setTitle('');
            setValue('');
            setPurchaseDate('');
            setObservation('');
            setProperty('');
            setCategory('Construção');
            setSubcategory('Iluminação');
            setAiFilePath(null);

            // ✅ Sucesso
            Swal.fire({
                icon: 'success',
                title: 'Nota fiscal salva!',
                text: 'Sua nota foi cadastrada com sucesso.',
                confirmButtonColor: '#0c4a6e'
            });

        } catch (error) {
            console.error('❌ Erro ao salvar nota:', error);

            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: 'Erro ao salvar a nota fiscal.',
                confirmButtonColor: '#0c4a6e'
            });
        } finally {
            setUploading(false);
        }
    };

    // 🔹 Análise via Inteligência Artificial
    const handleAnalyzeAI = async () => {
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Nenhum arquivo',
                text: 'Anexe um documento primeiro para que a IA possa analisar.',
                confirmButtonColor: '#0c4a6e'
            });
            return;
        }

        setAnalyzing(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const aiResponse = await axios.post(`${BASE_URL}/api/ai/extract`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const responseData = aiResponse.data.data;
            const parsedFilePath = aiResponse.data.filePath;

            if (responseData.title) setTitle(responseData.title);
            if (responseData.totalValue !== null) setValue(responseData.totalValue.toString());
            if (responseData.emissionDate) setPurchaseDate(responseData.emissionDate);
            if (responseData.observation) setObservation(responseData.observation);
            
            // Só sobrescreve categoria se for válida
            if (responseData.category === "Construção" || responseData.category === "Reforma") {
                setCategory(responseData.category);
            }
            if (subcategories.includes(responseData.subcategory)) {
                setSubcategory(responseData.subcategory);
            }

            if (parsedFilePath) setAiFilePath(parsedFilePath);

            // Alerta Humanizado baseado no Gemini
            if (responseData.successStatus === 'FULL') {
                Swal.fire({
                    icon: 'success',
                    title: 'Leitura concluída!',
                    text: responseData.aiMessage || 'Todos os dados foram extraídos com sucesso.',
                    confirmButtonColor: '#0c4a6e'
                });
            } else if (responseData.successStatus === 'PARTIAL') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Leitura Incompleta',
                    text: responseData.aiMessage,
                    confirmButtonColor: '#eab308'
                });
            } else if (responseData.successStatus === 'FAILED') {
                Swal.fire({
                    icon: 'error',
                    title: 'Não foi possível ler',
                    text: responseData.aiMessage,
                    confirmButtonColor: '#ef4444'
                });
            } else {
                 Swal.fire({
                    icon: 'success',
                    title: 'Dados preenchidos',
                    text: 'A IA preencheu os campos disponíveis.',
                    confirmButtonColor: '#0c4a6e',
                    timer: 2000
                });
            }

        } catch (error) {
            console.error('Erro na análise da IA:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro na IA',
                text: 'Não foi possível analisar o documento no momento.',
                confirmButtonColor: '#0c4a6e'
            });
        } finally {
            setAnalyzing(false);
        }
    };
    return (
        <div className="bg-white min-h-screen pt-10 px-4">
            <div className="max-w-5xl w-full mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-[#0c4a6e] leading-tight">Registrar Nova Nota Fiscal</h2>
                    <p className="mt-1 text-sm text-[#2f6687]">Preencha os dados e anexe o comprovante.</p>
                </div>

                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            type="text"
                            placeholder="Título da Nota"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Valor (R$)"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                        <Select
                            value={property}
                            onChange={(e) => setProperty(e.target.value)}
                            placeholderOption="Selecione um imóvel"
                            options={properties.map((p) => ({ value: p.id, label: p.nome }))}
                        />
                    </div>

                    <textarea
                        placeholder="Observações ou Descrição Detalhada"
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] resize-none"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            options={[
                                { value: 'Construção', label: 'Construção' },
                                { value: 'Reforma', label: 'Reforma' }
                            ]}
                        />
                        <Select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            options={subcategories.map((item) => ({ value: item, label: item }))}
                        />
                    </div>

                    <label className="group flex items-center justify-center w-full border-2 border-dashed border-blue-300 rounded-lg px-6 py-4 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50">
                        <IoMdCloudUpload size={24} className="text-blue-400 group-hover:text-blue-500 transition-colors mr-3" />
                        <span className="text-blue-600 font-medium text-base">
                            {file ? file.name : 'Clique para anexar comprovante'}
                        </span>
                        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>

                    {/* SEÇÃO DA INTELIGÊNCIA ARTIFICIAL */}
                    <div className="flex flex-col items-center bg-sky-50 border border-sky-100 p-4 rounded-xl mt-4 shadow-sm">
                        <p className="text-sm text-sky-800 font-medium mb-3 text-center">
                            A Inteligência Artificial pode ler comprovantes borrados ou escritos à mão, mas para usar a IA você precisa anexar um arquivo primeiro.
                        </p>
                        <Button
                            type="button"
                            onClick={handleAnalyzeAI}
                            disabled={!file}
                            isLoading={analyzing}
                            variant="secondary"
                        >
                            ✨ Acionar IA
                        </Button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            isLoading={uploading}
                        >
                            Salvar Nota Fiscal
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFileView;

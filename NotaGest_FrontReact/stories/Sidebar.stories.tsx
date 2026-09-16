import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from '../components/Sidebar/Sidebar';
import React, { useState } from 'react';

const meta: Meta<typeof Sidebar> = {
    title: 'Dashboard/Sidebar',
    component: Sidebar,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Interactive wrapper to manage local state inside Storybook
const SidebarWrapper = (args: any) => {
    const [isCollapsed, setIsCollapsed] = useState(args.isCollapsed || false);
    const [activeView, setActiveView] = useState(args.activeView || 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(args.isSidebarOpen || false);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                {...args}
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex-1 p-8 text-gray-500 font-medium">
                Área Principal (Conteúdo da Rota Ativa: <span className="text-blue-600 font-bold">{activeView}</span>)
            </div>
        </div>
    );
};

export const Expanded: Story = {
    render: (args: React.ComponentProps<typeof Sidebar>) => <SidebarWrapper {...args} />,
    args: {
        isCollapsed: false,
        activeView: 'dashboard',
        handleListFiles: () => console.log('Listar arquivos clicado!'),
        handleListProperties: () => console.log('Listar imóveis clicado!'),
        generatePDF: () => console.log('Gerar PDF clicado!'),
        exportExcel: () => console.log('Exportar Excel clicado!'),
    },
};

export const Collapsed: Story = {
    render: (args: React.ComponentProps<typeof Sidebar>) => <SidebarWrapper {...args} />,
    args: {
        isCollapsed: true,
        activeView: 'chat',
        handleListFiles: () => {},
        handleListProperties: () => {},
        generatePDF: () => {},
        exportExcel: () => {},
    },
};

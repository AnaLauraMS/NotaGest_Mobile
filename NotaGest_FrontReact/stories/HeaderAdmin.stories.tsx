import type { Meta, StoryObj } from '@storybook/react';
import HeaderAdmin from '../components/HeaderAdmin/HeaderAdmin';

// Mock global fetch & localStorage for browser compatibility inside Storybook
if (typeof window !== 'undefined') {
    window.localStorage.setItem('token', 'mock-token');
    window.fetch = () => {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                nome: 'Ranzer',
                email: 'ranzer@notagest.com'
            }),
        } as Response);
    };
}

const meta: Meta<typeof HeaderAdmin> = {
    title: 'Dashboard/HeaderAdmin',
    component: HeaderAdmin,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeaderAdmin>;

export const Default: Story = {
    args: {
        toggleSidebar: () => console.log('Sidebar toggled!'),
        setActiveView: (view: string) => console.log(`View changed to: ${view}`),
    },
};

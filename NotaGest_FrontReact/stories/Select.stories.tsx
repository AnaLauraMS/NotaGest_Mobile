import type { Meta, StoryObj } from '@storybook/react';
import Select from '../components/ui/Select';

const meta: Meta<typeof Select> = {
    title: 'UI/Select',
    component: Select,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Select>;

const sampleOptions = [
    { value: 'op1', label: 'Apartamento Centro' },
    { value: 'op2', label: 'Casa de Praia' },
    { value: 'op3', label: 'Chácara Interior' },
];

export const Default: Story = {
    args: {
        label: 'Selecione o Imóvel',
        placeholderOption: 'Selecione um imóvel da lista',
        options: sampleOptions,
        required: true,
    },
};

export const Subcategories: Story = {
    args: {
        label: 'Subcategoria',
        options: [
            { value: '1', label: 'Iluminação' },
            { value: '2', label: 'Ferragem' },
            { value: '3', label: 'Hidráulica' },
            { value: '4', label: 'Pintura' },
        ],
        required: true,
    },
};

export const ValidationError: Story = {
    args: {
        label: 'Categoria',
        options: [
            { value: 'const', label: 'Construção' },
            { value: 'ref', label: 'Reforma' },
        ],
        placeholderOption: 'Escolha uma categoria',
        error: 'Esta categoria é obrigatória.',
    },
};

export const Disabled: Story = {
    args: {
        label: 'Escolha Bloqueada',
        options: sampleOptions,
        placeholderOption: 'Carregando imóveis...',
        disabled: true,
    },
};

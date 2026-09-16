import type { Meta, StoryObj } from '@storybook/react';
import Input from '../components/ui/Input';

const meta: Meta<typeof Input> = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'password', 'email', 'number', 'date'],
        },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        label: 'Nome do Imóvel',
        placeholder: 'Digite o nome do seu imóvel',
        required: true,
    },
};

export const Password: Story = {
    args: {
        label: 'Senha',
        type: 'password',
        placeholder: 'Digite sua senha',
        required: true,
    },
};

export const Email: Story = {
    args: {
        label: 'E-mail',
        type: 'email',
        placeholder: 'seuemail@exemplo.com',
        required: true,
    },
};

export const Number: Story = {
    args: {
        label: 'Valor da Nota (R$)',
        type: 'number',
        placeholder: '0.00',
        required: true,
    },
};

export const DateInput: Story = {
    args: {
        label: 'Data da Compra',
        type: 'date',
        required: true,
    },
};

export const ValidationError: Story = {
    args: {
        label: 'E-mail',
        type: 'email',
        value: 'email-invalido',
        error: 'Por favor, insira um e-mail válido.',
    },
};

export const Disabled: Story = {
    args: {
        label: 'Campo Bloqueado',
        placeholder: 'Você não pode editar este campo',
        disabled: true,
    },
};

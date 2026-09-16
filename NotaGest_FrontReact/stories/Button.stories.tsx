import type { Meta, StoryObj } from '@storybook/react';
import Button from '../components/ui/Button';

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline', 'danger'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        isLoading: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Salvar Nota Fiscal',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Confirmar Cadastro',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Voltar para Home',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Excluir Item',
    },
};

export const Loading: Story = {
    args: {
        variant: 'primary',
        isLoading: true,
        children: 'Salvando...',
    },
};

export const Disabled: Story = {
    args: {
        variant: 'primary',
        disabled: true,
        children: 'Desabilitado',
    },
};

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Input from './Input';

test('renders input with label correctly (AAA)', () => {
    // Arrange
    const labelText = 'Nome';
    const inputId = 'nome-input';
    
    // Act
    render(<Input label={labelText} id={inputId} />);
    
    // Assert
    const labelElement = screen.getByText(labelText);
    const inputElement = screen.getByLabelText(labelText);
    expect(labelElement).toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
});

test('handles user typing (AAA)', async () => {
    // Arrange
    render(<Input placeholder="Digite seu e-mail" />);
    const inputElement = screen.getByPlaceholderText('Digite seu e-mail');
    
    // Act
    await userEvent.type(inputElement, 'teste@notagest.com');
    
    // Assert
    expect(inputElement).toHaveValue('teste@notagest.com');
});

test('displays error message when provided (AAA)', () => {
    // Arrange
    const errorMessage = 'E-mail inválido';
    
    // Act
    render(<Input error={errorMessage} />);
    
    // Assert
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('text-red-500');
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from './Button';

test('renders button children correctly (AAA)', () => {
    // Arrange
    const text = 'Clique Aqui';
    
    // Act
    render(<Button>{text}</Button>);
    
    // Assert
    const buttonElement = screen.getByRole('button', { name: text });
    expect(buttonElement).toBeInTheDocument();
});

test('handles click events (AAA)', async () => {
    // Arrange
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    // Act
    const buttonElement = screen.getByRole('button');
    await userEvent.click(buttonElement);
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('disables button when loading (AAA)', () => {
    // Arrange
    render(<Button isLoading={true}>Aguarde</Button>);
    
    // Act
    const buttonElement = screen.getByRole('button');
    
    // Assert
    expect(buttonElement).toBeDisabled();
});

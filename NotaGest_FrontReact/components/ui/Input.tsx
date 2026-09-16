'use client';
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    id,
    required,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                id={id}
                required={required}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] transition placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

export default Input;

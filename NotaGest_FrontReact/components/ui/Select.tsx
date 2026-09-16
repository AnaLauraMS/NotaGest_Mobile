'use client';
import React from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholderOption?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    placeholderOption,
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
            <select
                id={id}
                required={required}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] transition text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                } ${className}`}
                {...props}
            >
                {placeholderOption && (
                    <option value="" disabled>
                        {placeholderOption}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

export default Select;

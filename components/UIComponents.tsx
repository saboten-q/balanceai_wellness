
import React, { ReactNode } from 'react';
import { LucideIcon, X, Check, ChevronDown } from 'lucide-react';

// --- Card ---
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  icon?: LucideIcon;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, title, icon: Icon }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl border border-surface-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center gap-3 mb-4">
        {Icon && <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><Icon size={20} strokeWidth={2} /></div>}
        {title && <h3 className="font-bold text-lg text-surface-900 tracking-tight">{title}</h3>}
      </div>
    )}
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const baseStyles = "relative overflow-hidden px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:shadow-primary-500/30",
    secondary: "bg-surface-100 text-surface-900 hover:bg-surface-200",
    ghost: "bg-transparent text-surface-900 hover:bg-surface-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex gap-1.5 items-center justify-center">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_100ms]" />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_300ms]" />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_500ms]" />
        </div>
      ) : children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-surface-900 mb-1.5 ml-1">{label}</label>}
    <input 
      className={`w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-surface-900 mb-1.5 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full appearance-none bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-surface-500">
        <ChevronDown size={18} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

// --- Checkbox (Organic Style) ---
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => (
  <div onClick={onChange} className="flex items-center gap-3 cursor-pointer group select-none">
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-200 ${checked ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-surface-300 group-hover:border-primary-400'}`}>
      {checked && <Check size={14} className="text-white animate-fade-in" strokeWidth={3} />}
    </div>
    {label && <span className={`text-sm transition-colors ${checked ? 'text-surface-400 line-through' : 'text-surface-900'}`}>{label}</span>}
  </div>
);

// --- Modal/Overlay ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative z-10 animate-slide-up overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-surface-100">
          <h3 className="font-bold text-lg text-surface-900 ml-2">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-500">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-0">
          {children}
        </div>
      </div>
    </div>
  );
};

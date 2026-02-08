import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    alignment?: 'left' | 'center' | 'right';
}

export default function Tooltip({ text, children, alignment = 'center' }: TooltipProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const getPositionClasses = () => {
        switch (alignment) {
            case 'left':
                return 'left-0 origin-top-left';
            case 'right':
                return 'right-0 origin-top-right';
            case 'center':
            default:
                return 'left-1/2 -translate-x-1/2 origin-top';
        }
    };

    const getArrowClasses = () => {
        switch (alignment) {
            case 'left':
                return 'left-4';
            case 'right':
                return 'right-4';
            case 'center':
            default:
                return 'left-1/2 -translate-x-1/2';
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={toggle}
        >
            {children}
            <div
                className={`
          absolute top-full mt-2 w-64 p-3 
          bg-gray-900 text-white text-xs rounded-lg shadow-2xl 
          transition-all duration-200 z-[100] text-center font-normal 
          normal-case tracking-normal whitespace-normal leading-relaxed
          ${getPositionClasses()}
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
            >
                {text}
                <div className={`absolute bottom-full border-8 border-transparent border-b-gray-900 ${getArrowClasses()}`}></div>
            </div>
        </div>
    );
}

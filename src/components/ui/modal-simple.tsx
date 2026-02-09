// Simple modal component to replace missing AlertDialog
import React from 'react';

export const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export const ModalContent = ({ children }) => <div className="p-4">{children}</div>;
export const ModalHeader = ({ children }) => <div className="pb-4">{children}</div>;
export const ModalFooter = ({ children }) => <div className="pt-4 flex justify-end space-x-2">{children}</div>;
export const ModalTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;

export const Button = ({ children, onClick, variant = "primary", ...props }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`} {...props}>
    {children}
  </button>
);
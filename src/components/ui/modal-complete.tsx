// Complete modal component to replace AlertDialog
import React from 'react';

export const Modal = ({ children, open, onOpenChange, title, ...props }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onOpenChange}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

export const ModalAction = ({ children, ...props }: any) => <div className="flex justify-end space-x-2 mt-4" {...props}>{children}</div>;
export const ModalCancel = ({ children, ...props }: any) => <button className="px-4 py-2 rounded bg-gray-200" {...props}>{children}</button>;
export const ModalContent = ({ children, ...props }: any) => <div className="p-4" {...props}>{children}</div>;
export const ModalDescription = ({ children, ...props }: any) => <p className="text-sm text-gray-600" {...props}>{children}</p>;
export const ModalFooter = ({ children, ...props }: any) => <div className="flex justify-end space-x-2 mt-4" {...props}>{children}</div>;
export const ModalHeader = ({ children, ...props }: any) => <div className="pb-4" {...props}>{children}</div>;
export const ModalTitle = ({ children, ...props }: any) => <h3 className="text-lg font-semibold" {...props}>{children}</h3>;
export const ModalTrigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;

export const Button = ({ children, onClick, variant = "primary", ...props }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`} {...props}>
    {children}
  </button>
);
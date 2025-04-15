import React, { useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Close modal if clicked outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-black/70 z-50" 
      onClick={handleClickOutside} // ✅ Detect clicks outside
    >
      <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full mx-4 max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-200 text-xl"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

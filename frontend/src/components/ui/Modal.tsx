import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ✅ Close modal if clicked outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" 
        onClick={handleClickOutside} // ✅ Detect clicks outside
      >
        <div
          ref={modalRef}
          className="relative z-10 w-[90%] max-w-md rounded-2xl border border-gray-700/70 bg-gray-800/95 p-6 text-white shadow-2xl animate-fadeIn"
        >
          <button 
            onClick={onClose} 
            className="absolute right-3 top-2 text-xl text-gray-400 hover:text-gray-200"
          >
            ✖
          </button>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </>,
    document.body
  );
};

export default Modal;

import React, { useRef } from "react";
import { FiTrash2 } from "react-icons/fi";

interface ConfirmRemoveSharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ownerName: string;
}

const ConfirmRemoveSharedModal = ({ isOpen, onClose, onConfirm, ownerName }: ConfirmRemoveSharedModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative"
      >
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-semibold text-white">Remove Shared Wishlists</h2>
        </div>

        <p className="text-gray-300 mt-2">
          Are you sure you want to remove all wishlists shared by{" "}
          <span className="text-red-400 font-semibold">{ownerName}</span>? 
        </p>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRemoveSharedModal;
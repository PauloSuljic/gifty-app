import Modal from "../Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  wishlistName?: string; // Optional for wishlist items
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, wishlistName }: ConfirmDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center text-center space-y-4 p-2 rounded-lg w-full">
        <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
        
        {/* ✅ Conditional Text */}
        {wishlistName ? (
          <p className="text-gray-300">
            Are you sure you want to delete <span className="text-red-400 font-semibold">{itemName}</span> from <span className="text-blue-400 font-semibold">{wishlistName}</span>?
          </p>
        ) : (
          <p className="text-gray-300">
            Are you sure you want to delete <span className="text-red-400 font-semibold">{itemName}</span>?
          </p>
        )}

        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-white transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white transition">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;

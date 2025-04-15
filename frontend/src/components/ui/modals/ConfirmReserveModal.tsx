import { useRef } from "react";

type ConfirmReserveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  actionType: "reserve" | "unreserve";
};

const ConfirmReserveModal = ({ isOpen, onClose, onConfirm, itemName, actionType }: ConfirmReserveModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isReserving = actionType === "reserve";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full mx-4 max-w-md"
      >
        <h2 className="text-xl font-semibold text-white">
          {isReserving ? "Confirm Reservation" : "Confirm Unreserve"}
        </h2>
        <p className="text-gray-300 mt-2">
          Are you sure you want to {isReserving ? "reserve" : "unreserve"} <span className="text-purple-400 font-semibold">{itemName}</span>?
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
            className={`px-4 py-2 rounded-lg transition text-white ${
              isReserving ? "bg-purple-600 hover:bg-purple-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isReserving ? "Reserve" : "Unreserve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReserveModal;

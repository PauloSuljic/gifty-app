import Modal from "../Modal";

type ConfirmReserveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  actionType: "reserve" | "unreserve";
};

const ConfirmReserveModal = ({ isOpen, onClose, onConfirm, itemName, actionType }: ConfirmReserveModalProps) => {
  if (!isOpen) return null;

  const isReserving = actionType === "reserve";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {isReserving ? "Confirm Reservation" : "Confirm Unreserve"}
        </h2>
        <p className="text-gray-300">
          Are you sure you want to {isReserving ? "reserve" : "unreserve"}{" "}
          <span className="text-purple-400 font-semibold">{itemName}</span>?
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg text-white transition ${
              isReserving ? "bg-purple-600 hover:bg-purple-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isReserving ? "Reserve" : "Unreserve"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmReserveModal;

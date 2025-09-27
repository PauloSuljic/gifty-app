import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiLock, FiUnlock, FiExternalLink, FiCopy } from "react-icons/fi";
import ConfirmReserveModal from "./ui/modals/ConfirmReserveModal";
import Modal from "./ui/Modal";

type WishlistItemProps = {
  id: string;
  name: string;
  link: string;
  isReserved: boolean;
  reservedBy?: string | null;
  wishlistOwner: string;
  currentUser?: string;
  context: "own" | "shared";
  onToggleReserve: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

const WishlistItem = ({
  name,
  link,
  isReserved,
  reservedBy,
  wishlistOwner,
  currentUser,
  context = "own",
  onToggleReserve,
  onDelete,
  onEdit,
}: WishlistItemProps) => {
  const [, setIsMobile] = useState(false);
  const [modalAction, setModalAction] = useState<"reserve" | "unreserve" | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const isGuest = !currentUser;
  const isOwner = wishlistOwner === currentUser;
  const isReserver = reservedBy === currentUser;

  const canReserve = !isGuest && !isReserved && !isOwner;
  const canUnreserve = !isGuest && isReserved && isReserver;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleConfirmClick = (type: "reserve" | "unreserve") => {
    setModalAction(type);
  };

  const isImage = link && /\.(jpeg|jpg|gif|png|webp)$/i.test(link);
  const imageToShow = isImage
    ? link
    : "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <>
      <div
        className="flex items-center gap-4 p-4 min-h-[80px] rounded-xl bg-[#232336] hover:border-purple-500 border border-transparent transition mb-3 cursor-pointer"
        onClick={() => link && setIsLinkModalOpen(true)}
      >
        <img
          src={imageToShow}
          alt={name}
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-gray-400 truncate">
            A thoughtful gift idea for your wishlist.
          </p>
        </div>
        <div className="flex gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button onClick={onEdit} className="text-gray-400 hover:text-purple-400">
              <FiEdit className="text-large" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-600">
              <FiTrash2 className="text-large" />
            </button>
          )}
        </div>
      </div>

      {/* Modal for link actions */}
      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Open Link</h2>
        <p className="text-sm text-gray-300 mb-4">Do you want to open this link?</p>
        <div className="flex gap-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-center"
            onClick={() => setIsLinkModalOpen(false)}
          >
            <FiExternalLink className="inline mr-1" /> Open
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setIsLinkModalOpen(false);
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white"
          >
            <FiCopy className="inline mr-1" /> Copy
          </button>
        </div>
      </Modal>

      {/* Reserve/Unreserve modal */}
      <ConfirmReserveModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        onConfirm={() => {
          setModalAction(null);
          onToggleReserve();
        }}
        itemName={name}
        actionType={modalAction || "reserve"}
      />
    </>
  );
};

export default WishlistItem;
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiLock, FiUnlock, FiExternalLink, FiMove } from "react-icons/fi";
import ConfirmReserveModal from "./ui/modals/ConfirmReserveModal";
import Modal from "./ui/Modal";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

type WishlistItemProps = {
  id: string;
  name: string;
  description?: string;
  link: string;
  isReserved: boolean;
  reservedBy?: string | null;
  wishlistOwner: string;
  currentUser?: string;
  hasReservedItemByCurrentUser?: boolean;
  imageUrl?: string;
  context: "own" | "shared" | "guest";
  onToggleReserve?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
  setNodeRef?: (node: HTMLElement | null) => void;
};

const WishlistItem = ({
  name,
  description,
  link,
  isReserved,
  reservedBy,
  currentUser,
  hasReservedItemByCurrentUser = false,
  imageUrl,
  context = "own",
  onToggleReserve,
  onDelete,
  onEdit,
  listeners,
  attributes,
}: WishlistItemProps) => {
  const [, setIsMobile] = useState(false);
  const [modalAction, setModalAction] = useState<"reserve" | "unreserve" | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const isReserver = reservedBy === currentUser;
  const reservationState = !isReserved
    ? "available"
    : isReserver
      ? "reservedByMe"
      : "reservedByOther";

  const reservationLabel =
    reservationState === "reservedByMe"
      ? "Reserved by you"
      : reservationState === "reservedByOther"
        ? "Reserved"
        : "Available";

  const reserveButtonClass =
    reservationState === "reservedByMe"
      ? "text-emerald-400 hover:text-emerald-300"
      : reservationState === "reservedByOther"
        ? "text-amber-400 hover:text-amber-300"
        : "text-gray-400 hover:text-purple-400";
  const isReservationBlockedByLimit = context === "shared" && hasReservedItemByCurrentUser && !isReserver;
  const isReservationBlockedByOtherUser = context !== "own" && isReserved && !isReserver;
  const isReserveDisabled =
    context === "guest" ||
    isReservationBlockedByLimit ||
    isReservationBlockedByOtherUser ||
    isReserver;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleConfirmClick = (type: "reserve" | "unreserve") => {
    setModalAction(type);
  };

  const imageToShow = imageUrl
  ? imageUrl
  : link && /\.(jpeg|jpg|gif|png|webp)$/i.test(link)
  ? link
  : "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0";

  return (
  <>
    <div
      className="flex items-center gap-4 p-4 min-h-[80px] w-full rounded-xl bg-gray-800 hover:border-purple-500 border border-transparent transition mb-3 cursor-default transition-transform duration-200 ease-in-out active:scale-[0.99] active:shadow-lg"
    >
      {/* 🟣 Drag handle */}
      {context === "own" && (
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-center text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
      >
        <FiMove size={18} />
      </div>
      )}

      {/* 🖼 Image */}
      <img
        src={imageToShow}
        alt={name}
        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
        onClick={() => link && setIsLinkModalOpen(true)}
      />

      {/* 📄 Info section */}
      <div className="flex-1 min-w-0" onClick={() => link && setIsLinkModalOpen(true)}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">{name}</h3>
          {context !== "own" && isReserved && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                reservationState === "reservedByMe"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {reservationLabel}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-400 line-clamp-2 italic leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* 🧩 Action icons */}
      <div className="flex gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {context === "own" ? (
          <>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-gray-400 hover:text-purple-400"
              >
                <FiEdit className="text-large" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-500 hover:text-red-600"
              >
                <FiTrash2 className="text-large" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();

              if (context === "guest") {
                window.location.href = "/login";
                return;
              }

              if (isReserved && !isReserver) {
                import("react-hot-toast").then(({ toast }) => {
                  toast.error("This item is already reserved by someone else.", {
                    duration: 3000,
                    position: "bottom-center",
                    style: {
                      background: "#333",
                      color: "#fff",
                      border: "1px solid #555",
                    },
                  });
                });
                return;
              }

              handleConfirmClick(isReserved ? "unreserve" : "reserve");
            }}
            className={reserveButtonClass}
            title={reservationLabel}
            aria-label={reservationLabel}
          >
            {isReserved ? <FiLock className="text-large" /> : <FiUnlock className="text-large" />}
          </button>
        )}
      </div>
    </div>

    {/* 🔗 Link Modal */}
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
        {context === "own" ? (
          <button
            onClick={() => {
              setIsLinkModalOpen(false);
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white"
          >
            Close
          </button>
        ) : (
          <button
            onClick={() => {
              if (context === "guest") {
                setIsLinkModalOpen(false);
                window.location.href = "/login";
                return;
              }

              if (isReserveDisabled) return;
              setIsLinkModalOpen(false);
              handleConfirmClick("reserve");
            }}
            disabled={isReserveDisabled}
            className={`flex-1 px-4 py-2 rounded-lg text-white ${
              isReserveDisabled
                ? "bg-gray-700 cursor-not-allowed opacity-70"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            Reserve
          </button>
        )}
      </div>
      {context === "shared" && isReservationBlockedByLimit && (
        <p className="mt-3 text-xs text-amber-300">
          You already reserved an item in this wishlist.
        </p>
      )}
      {context === "shared" && isReservationBlockedByOtherUser && (
        <p className="mt-3 text-xs text-amber-300">
          This item is already reserved by someone else.
        </p>
      )}
      {context === "shared" && isReserver && (
        <p className="mt-3 text-xs text-emerald-300">
          This item is reserved by you.
        </p>
      )}
    </Modal>

    {/* 🎁 Reserve/Unreserve Modal */}
    <ConfirmReserveModal
      isOpen={modalAction !== null}
      onClose={() => setModalAction(null)}
      onConfirm={() => {
        setModalAction(null);
        if (onToggleReserve) {
          onToggleReserve();
        }
      }}
      itemName={name}
      actionType={modalAction || "reserve"}
    />
  </>
);
};

export default WishlistItem;

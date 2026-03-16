import { FiMove, FiMoreVertical, FiLink, FiEdit, FiTrash2 } from "react-icons/fi";
import { Menu } from "@headlessui/react";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

const fallbackWishlistImage =
  "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0";

type WishlistCardProps = {
  id: string;
  name: string;
  itemCount: number;
  coverImage?: string;
  onClick: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners; // 👈 from dnd-kit
  attributes?: DraggableAttributes; // 👈 from dnd-kit
} & HTMLAttributes<HTMLDivElement>;

export const WishlistCard = ({
  name,
  itemCount,
  coverImage,
  onClick,
  onShare,
  onRename,
  onDelete,
  listeners,
  attributes,
  ...rest
}: WishlistCardProps) => {
  const [imageToShow, setImageToShow] = useState(coverImage || fallbackWishlistImage);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const pressStart = useRef(0);
  const dragStarted = useRef(false);

  useEffect(() => {
    setImageToShow(coverImage || fallbackWishlistImage);
  }, [coverImage]);

  // 🖐️ Distinguish short tap from drag (for mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    // 👇 Prevent starting a drag if touch began on a button or menu
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menu"]')) return;

    dragStarted.current = false;
    pressStart.current = Date.now();
    pressTimer.current = setTimeout(() => {
      dragStarted.current = true;
      pressTimer.current = null;
    }, 250);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      if (!dragStarted.current && Date.now() - pressStart.current < 250) {
        onClick();
      }
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border border-purple-500/20 bg-gray-800/95 shadow-sm cursor-pointer transition-transform hover:scale-[1.015] hover:border-purple-400/35 hover:shadow-[0_10px_30px_rgba(0,0,0,0.24)] active:scale-[0.99]"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...rest}
    >
      <div className="relative">
        <img
          src={imageToShow}
          alt={name}
          className="h-28 w-full object-cover select-none xl:h-24"
          draggable={false}
          onError={() => setImageToShow(fallbackWishlistImage)}
        />

        {/* 🟣 Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="absolute left-2 top-2 rounded-lg border border-white/10 bg-black/35 p-1 text-gray-100 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => e.stopPropagation()}  // 👈 prevent event bubbling to the menu
          onClick={(e) => e.stopPropagation()}
        >
          <FiMove size={14} />
        </div>

        {/* Dropdown menu */}
        <Menu as="div" className="absolute top-2 right-2 text-left z-20">
          <Menu.Button
            onClick={(e) => {
              e.stopPropagation();           // stop click bubbling
              e.nativeEvent.stopImmediatePropagation(); // ensure parent doesn't catch touch simulation
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
            className="rounded-full border border-white/10 bg-black/35 p-1 text-white backdrop-blur-sm hover:bg-black/55 pointer-events-auto"
          >
            <FiMoreVertical size={16} />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                    }}
                    className={`${
                      active ? "bg-gray-700" : ""
                    } flex items-center w-full px-3 py-2 text-sm text-white gap-2`}
                  >
                    <FiLink /> Share
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename();
                    }}
                    className={`${
                      active ? "bg-gray-700" : ""
                    } flex items-center w-full px-3 py-2 text-sm text-white gap-2`}
                  >
                    <FiEdit /> Rename
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className={`${
                      active ? "bg-red-700" : ""
                    } flex items-center w-full px-3 py-2 text-sm text-red-400 gap-2`}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      <div className="space-y-1 px-4 py-3">
        <h4 className="line-clamp-1 text-base font-semibold text-white">{name}</h4>
        <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>
    </div>
  );
};

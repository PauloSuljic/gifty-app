import { FiMove, FiMoreVertical, FiLink, FiEdit, FiTrash2 } from "react-icons/fi";
import { Menu } from "@headlessui/react";
import { HTMLAttributes, useRef } from "react";

type WishlistCardProps = {
  id: string;
  name: string;
  itemCount: number;
  coverImage?: string;
  onClick: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  listeners?: any;       // 👈 from dnd-kit
  attributes?: any;      // 👈 from dnd-kit
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
  const isValidImage = coverImage && /\.(jpeg|jpg|gif|png|webp)$/i.test(coverImage);
  const imageToShow = isValidImage
    ? coverImage
    : "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0";

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const pressStart = useRef(0);
  const dragStarted = useRef(false);

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
      className="rounded-xl shadow-sm cursor-pointer hover:shadow-md border border-purple-500/20 bg-gray-800 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...rest}
    >
      <div className="relative">
        <img
          src={imageToShow}
          alt={name}
          className="w-full h-32 object-cover rounded-t-xl select-none"
          draggable={false}
        />

        {/* 🟣 Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="absolute top-2 left-2 p-1 bg-black/40 rounded-md cursor-grab active:cursor-grabbing select-none"
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
            className="p-1 bg-black/40 rounded-full text-white hover:bg-black/60 pointer-events-auto"
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

      <div className="p-3">
        <h4 className="text-sm font-medium mb-1">{name}</h4>
        <p className="text-xs text-gray-400">{itemCount} items</p>
      </div>
    </div>
  );
};
import { FiMoreVertical, FiLink, FiEdit, FiTrash2 } from "react-icons/fi";
import { Menu } from "@headlessui/react";

type WishlistCardProps = {
  id: string;
  name: string;
  itemCount: number;
  coverImage?: string;
  onClick: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export const WishlistCard = ({
  name,
  itemCount,
  coverImage,
  onClick,
  onShare,
  onRename,
  onDelete,
}: WishlistCardProps) => {
  const isValidImage = coverImage && /\.(jpeg|jpg|gif|png|webp)$/i.test(coverImage);
  const imageToShow =
    isValidImage
      ? coverImage
      : "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div
      className="rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-purple-500/20 bg-[#232336]"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={imageToShow}
          alt={name}
          className="w-full h-32 object-cover rounded-t-xl"
        />

        {/* Dropdown menu */}
        <Menu as="div" className="absolute top-2 right-2 text-left">
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            className="p-1 bg-black/40 rounded-full text-white hover:bg-black/60"
          >
            <FiMoreVertical size={16} />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-[#2e2e3f] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
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
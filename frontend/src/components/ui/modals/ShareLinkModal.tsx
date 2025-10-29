import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import Modal from "../Modal";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareLinkModal = ({ isOpen, onClose, shareUrl }: ShareLinkModalProps) => {
  const [isCopied, setIsCopied] = useState(false); // ✅ Track if link is copied

  // ✅ Copy to clipboard & show "Copied!" temporarily
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true); // ✅ Set copied state
      setTimeout(() => setIsCopied(false), 2000); // ✅ Reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-4 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white">Share Wishlist</h2>
        <p className="text-gray-300">Share this link with others:</p>
        
        {/* ✅ Share Link Input */}
        <div className="flex items-center w-full bg-gray-700 p-2 rounded-lg">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="bg-transparent text-white w-full px-2 outline-none"
          />
          <button 
            onClick={copyToClipboard} 
            className={`ml-2 px-4 py-2 rounded-lg transition flex items-center space-x-2 
              ${isCopied ? "bg-green-500" : "bg-purple-500 hover:bg-purple-600"}`}
          >
            {isCopied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            <span>{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareLinkModal;

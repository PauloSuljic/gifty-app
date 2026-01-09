import { useCallback, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "./useAuth";

export function useShareLink() {
  const { firebaseUser } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const generateShareLink = useCallback(
    async (wishlistId: string) => {
      const token = await firebaseUser?.getIdToken();
      const response = await apiFetch(`/api/shared-links/${wishlistId}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const generatedUrl = `${window.location.origin}/shared/${data.shareCode}`;

        setShareUrl(generatedUrl);
        setIsShareModalOpen(true);
      } else {
        console.error("Error generating share link:", await response.json());
      }
    },
    [firebaseUser]
  );

  return {
    isShareModalOpen,
    shareUrl,
    setIsShareModalOpen,
    generateShareLink,
  };
}

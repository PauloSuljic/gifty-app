import { useCallback, useState } from "react";
import { ApiError } from "../shared/lib/apiClient";
import { generateShareLink as generateShareLinkApi } from "../shared/lib/sharedLinks";
import { useAuth } from "./useAuth";

export function useShareLink() {
  const { firebaseUser } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const generateShareLink = useCallback(
    async (wishlistId: string) => {
      const token = await firebaseUser?.getIdToken();
      try {
        const data = await generateShareLinkApi(wishlistId, token);
        const generatedUrl = `${window.location.origin}/shared/${data.shareCode}`;

        setShareUrl(generatedUrl);
        setIsShareModalOpen(true);
      } catch (error) {
        if (error instanceof ApiError) {
          console.error("Error generating share link:", error.details ?? error.message);
        } else {
          console.error("Error generating share link:", error);
        }
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

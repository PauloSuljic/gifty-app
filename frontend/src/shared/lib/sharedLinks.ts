import { apiClient } from "./apiClient";

export type SharedWithMeWishlistItem = {
  id: string;
  name: string;
  link?: string;
  isReserved: boolean;
  reservedBy?: string | null;
  imageUrl?: string;
  order?: number | null;
};

export type SharedWithMeWishlist = {
  id: string;
  name: string;
  items: SharedWithMeWishlistItem[];
  coverImage?: string;
  shareCode: string;
};

export type SharedWithMeGroup = {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerDateOfBirth?: string | null;
  wishlists: SharedWithMeWishlist[];
};

export type SharedWishlistItem = {
  id: string;
  name: string;
  link: string;
  description?: string;
  isReserved: boolean;
  reservedBy?: string | null;
};

export type SharedWishlistDetails = {
  id: string;
  name: string;
  items: SharedWishlistItem[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerBio?: string;
  coverImage?: string;
};

export type ShareLinkResponse = {
  shareCode: string;
};

const requireToken = (token: string | undefined, action: string) => {
  if (!token) {
    throw new Error(`Auth token is required to ${action}.`);
  }

  return token;
};

export const generateShareLink = (wishlistId: string, token?: string) =>
  apiClient.post<ShareLinkResponse>(`/api/shared-links/${wishlistId}/generate`, undefined, {
    token: requireToken(token, "generate a share link"),
  });

export const getSharedWithMe = (token?: string) =>
  apiClient.get<SharedWithMeGroup[]>("/api/shared-links/shared-with-me", {
    token: requireToken(token, "load shared wishlists"),
  });

export const removeSharedWithMe = (ownerId: string, token?: string) =>
  apiClient.del<void>(`/api/shared-links/shared-with-me/${ownerId}`, {
    token: requireToken(token, "remove shared wishlists"),
  });

export const getSharedWishlist = (shareCode: string, token?: string) =>
  apiClient.get<SharedWishlistDetails>(`/api/shared-links/${shareCode}`, token ? { token } : undefined);

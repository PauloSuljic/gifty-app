type WishlistCoverImageItem = {
  imageUrl?: string | null;
  order?: number | null;
};

type GetWishlistCoverImageOptions<T extends WishlistCoverImageItem> = {
  items?: T[] | null;
  fallbackImage: string;
  wishlistCoverImage?: string | null;
};

export const getWishlistCoverImage = <T extends WishlistCoverImageItem>({
  items,
  fallbackImage,
  wishlistCoverImage,
}: GetWishlistCoverImageOptions<T>): string => {
  if (wishlistCoverImage) {
    return wishlistCoverImage;
  }

  if (!items || items.length === 0) {
    return fallbackImage;
  }

  const highestOrderedItemWithImage = items.reduce<T | null>((best, item) => {
    if (!item.imageUrl) return best;

    if (!best) return item;

    const bestOrder = best.order ?? 0;
    const itemOrder = item.order ?? 0;

    return itemOrder > bestOrder ? item : best;
  }, null);

  return highestOrderedItemWithImage?.imageUrl || fallbackImage;
};

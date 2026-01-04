import { useCallback } from "react";
import {
  closestCenter,
  DragEndEvent,
  DragOverEvent,
  DndContextProps,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import toast from "react-hot-toast";

type PersistOrderFn = (reordered: { id: string; order: number }[]) => Promise<void>;

export function useWishlistDnd(
  wishlistOrder: string[],
  setWishlistOrder: (order: string[]) => void,
  persistWishlistOrder: PersistOrderFn
) {
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  }, []);

  const handleDragStart = useCallback(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      document.body.style.overflow = "";

      if (!over || active.id === over.id) return;

      const oldIndex = wishlistOrder.indexOf(active.id as string);
      const newIndex = wishlistOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(wishlistOrder, oldIndex, newIndex);
      setWishlistOrder(newOrder);

      const reordered = newOrder.map((id, index) => ({
        id,
        order: index,
      }));

      try {
        await persistWishlistOrder(reordered);
      } catch (err) {
        console.error("Error:", err);
        toast.error("Something went wrong reordering wishlists.");
      }
    },
    [persistWishlistOrder, setWishlistOrder, wishlistOrder]
  );

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 350,
      tolerance: 8,
    },
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const mobileSensors = useSensors(touchSensor);
  const desktopSensors = useSensors(touchSensor, mouseSensor);
  const sensors = isMobile ? mobileSensors : desktopSensors;

  return {
    sensors,
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDragStart: handleDragStart,
    } as Pick<
      DndContextProps,
      "sensors" | "collisionDetection" | "onDragEnd" | "onDragOver" | "onDragStart"
    >,
    sortableStrategy: rectSortingStrategy,
  };
}

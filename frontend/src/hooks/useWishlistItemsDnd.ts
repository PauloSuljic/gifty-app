import { Dispatch, SetStateAction, useCallback } from "react";
import {
  closestCenter,
  DragEndEvent,
  DndContextProps,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { WishlistDetailsItemType } from "./useWishlistDetails";

type PersistOrderFn = (reordered: WishlistDetailsItemType[]) => Promise<void>;

export function useWishlistItemsDnd(
  items: WishlistDetailsItemType[],
  setItems: Dispatch<SetStateAction<WishlistDetailsItemType[]>>,
  persistItemOrder: PersistOrderFn
) {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 350,
      tolerance: 8,
    },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const mouseSensor = useSensor(MouseSensor);

  const sensors = useSensors(isMobile ? touchSensor : pointerSensor, mouseSensor);

  const handleDragStart = useCallback(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      document.body.style.overflow = "";

      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);

      await persistItemOrder(reordered);
    },
    [items, persistItemOrder, setItems]
  );

  return {
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    } as Pick<DndContextProps, "sensors" | "collisionDetection" | "onDragStart" | "onDragEnd">,
    sortableStrategy: verticalListSortingStrategy,
  };
}

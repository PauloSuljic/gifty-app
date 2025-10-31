import { useSortable } from "@dnd-kit/sortable";
import { ReactNode } from "react";
import { motion } from "framer-motion";

type SortableItemProps = {
  id: string;
  children: (props: {
  setNodeRef: ReturnType<typeof useSortable>["setNodeRef"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
}) => ReactNode;
};

export const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scaleX ?? 1}, ${transform.scaleY ?? 1})`
      : undefined,
    transition: transition ?? "transform 0.25s ease, box-shadow 0.25s ease",
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 50 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none", // ✅ prevents scroll interference
    WebkitTapHighlightColor: "transparent", // ✅ removes blue flash on iOS
    boxShadow: isDragging
      ? "0 8px 20px rgba(0,0,0,0.25)"
      : "0 2px 6px rgba(0,0,0,0.15)",
    willChange: "transform",
    backfaceVisibility: "hidden",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="relative select-none transition-transform duration-300 ease-in-out"
    >
      {children({ listeners, attributes, setNodeRef })}
    </motion.div>
  );
};
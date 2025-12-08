import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { Chip, Stack, Box } from "@mui/material";
import { useEffect, useState } from "react";

export default function ChipDragSort({ value, onChange }) {
  const [items, setItems] = useState(value);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,   // long press (iPhone)
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    const sorted = arrayMove(items, oldIndex, newIndex);
    setItems(sorted);
    onChange(sorted);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <Stack direction="row" spacing={1}>
          {items.map((id) => (
            <SortableChip key={id} id={id} />
          ))}
        </Stack>
      </SortableContext>

      {/* ⭐ PERFECT: DragOverlay prevents resizing while dragging */}
      <DragOverlay>
        {activeId ? <DragChip id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

//
// ✔ Sortable chip with smooth animation
//
function SortableChip({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Chip label={id} size="small" />
    </Box>
  );
}

//
// ✔ Chip used in overlay (clone), NEVER resizes
//
function DragChip({ id }) {
  return (
    <Chip
      label={id}
      size="small"
      sx={{
        boxShadow: 4,
        opacity: 0.9,
        cursor: "grabbing",
      }}
    />
  );
}

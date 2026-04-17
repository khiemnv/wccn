import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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

type ChipDragSortProps = {
  value: string[];
  onChange: (items: string[]) => void;
};

export default function ChipDragSort({ value, onChange }: ChipDragSortProps) {
  const [items, setItems] = useState<string[]>(value);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    const sorted = arrayMove(items, oldIndex, newIndex);
    setItems(sorted);
    onChange(sorted);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <Stack direction="row" spacing={1}>
          {items.map((id) => (
            <SortableChip key={id} id={id} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

function SortableChip({ id }: { id: string }) {
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

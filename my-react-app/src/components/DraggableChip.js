import { Box, Chip, Stack } from "@mui/material";
import { useEffect, useState } from "react";

export default function ChipDragSort({value, onChange}) {
  const [items, setItems] = useState(value);
  useEffect(()=>{
    setItems(value)
  },[value])

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) setDragOverIndex(null);
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const updated = [...items];
      const [draggedParagraph] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedParagraph);
      onChange(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    // If a drag ended while over an item but drop wasn't fired,
    // ensure we still reorder based on the current dragOverIndex.
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const updated = [...items];
      const [draggedParagraph] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, draggedParagraph);
      onChange(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
      <Stack direction="row" spacing={1}>
        {items.map((item, idx) => {
          const isDragged = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx && !isDragged;
          return(
          <Box key={idx}
          sx={{
                position: "relative",
                // mb: isMobile ? 1 : 2,
                opacity: isDragged ? 0.5 : 1,
                transition: "opacity 0.2s, background-color 0.15s",
                backgroundColor: isDragOver
                  ? "rgba(25,118,210,0.08)"
                  : isDragged
                    ? "action.hover"
                    : "transparent",
                borderRadius: 1,
                m: 1,
              }}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnter={() => setDragOverIndex(idx)}
              onDragLeave={() => handleDragLeave(idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
          >
            <Chip id={item} label={item} />
          </Box>
        )})}
      </Stack>
  );
}

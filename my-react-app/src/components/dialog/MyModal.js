import { Box, Modal, useMediaQuery } from "@mui/material";

export function MyModal({ open, onClose, children: Element }) {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 600,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
          // maxHeight: isMobile ? "calc(var(--vh) * 90)" : "calc(var(--vh) * 80)",
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Element}
      </Box>
    </Modal>
  );
}
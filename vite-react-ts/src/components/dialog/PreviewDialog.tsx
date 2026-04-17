import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { CANCEL, YES } from "../../constant/strings";

type PreviewDialogProps = {
  onOk: () => void;
  title: string;
  content: ReactNode;
  children: ReactNode;
};

export function PreviewDialog({ onOk, title, content, children }: PreviewDialogProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div onClick={handleClickOpen}>{children}</div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "min-content",
            },
          },
          textAlign: "center",
        }}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{CANCEL}</Button>
          <Button
            onClick={() => {
              onOk();
              handleClose();
            }}
          >
            {YES}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { CANCEL, YES } from "../../constant/strings";

type ConfirmButtonProps = {
  onOk: () => void;
  title: string;
  content: ReactNode;
  isRunning?: boolean;
  children: ReactNode;
};

export function ConfirmButton({ onOk, title, content, isRunning, children }: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    if (!isRunning) {
      setOpen(true);
    }
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
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{CANCEL}</Button>
          <Button
            onClick={() => {
              handleClose();
              onOk();
            }}
            autoFocus
          >
            {YES}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

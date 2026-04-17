import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CANCEL, DONE, NOTICE, YES, ERROR, SUCCESS } from "../../constant/strings";

type AlertDialogProps = {
  onOk: () => void;
  title: string;
  message: string;
  children?: ReactNode;
};

export function AlertDialog({ onOk, title, message, children }: AlertDialogProps) {
  const [open, setOpen] = useState(true);

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
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
              onOk();
            }}
          >
            {YES}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export function AlertDlg2({ title = NOTICE, error, onOk = () => {} }: { title?: string; error?: string; onOk?: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | undefined>(error);
  useEffect(() => {
    setOpen(!!error);
    if (error) {
      setMsg(error);
    }
  }, [error]);
  function handleClose() {
    setOpen(false);
  }
  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {msg}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
            onOk();
          }}
        >
          {YES}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Notify({ error, onOk }: { error?: string; onOk: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | undefined>(error);
  useEffect(() => {
    setOpen(!!error);
    if (error) {
      setMsg(error);
    }
  }, [error]);
  function handleClose() {
    setOpen(false);
    onOk();
  }
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={msg ? ERROR : SUCCESS}
        sx={{ width: "100%", whiteSpace: "pre-line" }}
      >
        {msg ? `${ERROR} \n「${msg}」` : DONE}
      </Alert>
    </Snackbar>
  );
}

export function ConfirmDlg({ question, onOk = () => {}, onCancel = () => {} }: { question?: string; onOk?: () => void; onCancel?: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | undefined>(question);
  useEffect(() => {
    setOpen(!!question);
    if (question) {
      setMsg(question);
    }
  }, [question]);
  function handleClose() {
    setOpen(false);
  }
  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"注意"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {msg}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
            onOk();
          }}
        >
          {YES}
        </Button>
        <Button
          onClick={() => {
            handleClose();
            onCancel();
          }}
        >
          {CANCEL}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

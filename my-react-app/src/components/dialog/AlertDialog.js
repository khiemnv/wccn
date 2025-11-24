import React, { useEffect, useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CANCEL, DONE, NOTICE, YES, ERROR, SUCCESS } from "../../constant/strings";

export function AlertDialog({ onOk, title, message, children: Element }) {
  const [open, setOpen] = React.useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div onClick={handleClickOpen}>{Element}</div>
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

export function AlertDlg2({ title = NOTICE, error, onOk = () => {} }) {
  const [open, setOpen] = useState();
  const [msg, setMsg] = useState(error);
  useEffect(() => {
    setOpen(!!error);
    if (!!error) {
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

export function Notify({ error, onOk }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(error);
  useEffect(() => {
    setOpen(!!error);
    if (!!error) {
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
        severity={!!msg ? ERROR : SUCCESS}
        sx={{ width: "100%", whiteSpace: "pre-line" }}
      >
        {!!msg ? `${ERROR} \n「${msg}」` : DONE}
      </Alert>
    </Snackbar>
  );
}

export function ConfirmDlg({ question, onOk = () => {}, onCancel = () => {} }) {
  const [open, setOpen] = useState();
  const [msg, setMsg] = useState(question);
  useEffect(() => {
    setOpen(!!question);
    if (!!question) {
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

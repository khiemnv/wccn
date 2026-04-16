import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { ConfirmButton } from "./ConfirmButton";
import { ERROR, SUCCESS } from "../../constant/notify";
import { DONE } from "../../constant/strings";

export function FeedbackButton({
  confirm,
  onClick,
  disabled,
  variant,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState();
  const [isRunning, setRunning] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  async function handleClick() {
    try {
      setRunning(true);
      var { error } = await onClick();
      setError(error);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setRunning(false);
      setOpen(true);
    }
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={error ? ERROR : SUCCESS}
          sx={{ width: "100%" }}
        >
          {error ? `${ERROR} ${error}` : DONE}
        </Alert>
      </Snackbar>
      {!confirm | disabled ? (
        <LoadingButton
          disabled={disabled}
          onClick={handleClick}
          loading={isRunning}
          variant={variant}
        >
          {children}
        </LoadingButton>
      ) : (
        <ConfirmButton
          onOk={handleClick}
          title={confirm.title}
          content={confirm.message}
          isRunning={isRunning}
        >
          <LoadingButton loading={isRunning} variant={variant}>
            {children}
          </LoadingButton>
        </ConfirmButton>
      )}
    </div>
  );
}

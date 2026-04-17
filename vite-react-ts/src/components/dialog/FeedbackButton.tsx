import { useState, type ReactNode } from "react";
import { Alert, Snackbar, Button } from "@mui/material";
import { ConfirmButton } from "./ConfirmButton";
import { ERROR, SUCCESS, DONE } from "../../constant/strings";

type FeedbackButtonProps = {
  confirm?: { title: string; message: string };
  onClick: () => Promise<{ error?: string }>;
  disabled?: boolean;
  variant?: "text" | "outlined" | "contained";
  children: ReactNode;
};

export function FeedbackButton({
  confirm,
  onClick,
  disabled,
  variant,
  children,
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
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
      const message = ex instanceof Error ? ex.message : String(ex);
      setError(message);
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
      {!confirm || disabled ? (
        <Button disabled={disabled || isRunning} onClick={handleClick} variant={variant}>
          {isRunning ? "Loading..." : children}
        </Button>
      ) : (
        <ConfirmButton
          onOk={handleClick}
          title={confirm.title}
          content={confirm.message}
          isRunning={isRunning}
        >
          <Button disabled={isRunning} variant={variant}>
            {children}
          </Button>
        </ConfirmButton>
      )}
    </div>
  );
}

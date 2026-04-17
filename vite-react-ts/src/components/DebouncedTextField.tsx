import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import debounce from "debounce";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { ChangeEvent } from "react";

type DebouncedTextFieldProps = Omit<TextFieldProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export const DebouncedTextField = ({ value, onChange, ...props }: DebouncedTextFieldProps) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const debouncedText = useMemo(
    () => debounce((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(event.target.value);
    }, 500),
    [onChange]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(e.target.value);
      debouncedText(e);
    },
    [debouncedText]
  );

  return <TextField value={text} onChange={handleChange} {...props} />;
};

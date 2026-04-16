import { TextField } from "@mui/material";
import debounce from "debounce";
import { useState, useEffect, useMemo, useCallback } from "react";

export const DebouncedTextField = ({ value, onChange, ...props }) => {
  const [text, setText] = useState(value);
  useEffect(() => {
    // historyRef.current=[p];
    // indexRef.current=0;
    setText(value);
  }, [value]);

  const debouncedText = useMemo(
    () => debounce((e) => {
      onChange(e);
    }, 500),
    [onChange]
  );
  const handleChange = useCallback(
    (e) => {
      setText(e.target.value);
      debouncedText(e);
    },
    [debouncedText]
  );
  return <TextField value={text} onChange={handleChange} {...props} />;
};

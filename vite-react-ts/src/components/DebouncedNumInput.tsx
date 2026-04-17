import { TextField } from "@mui/material";
import debounce from "debounce";
import { useState, useMemo, useEffect } from "react";
import type { ChangeEvent } from "react";

type DebouncedNumInputProps = {
  id: string | number;
  onChangeId: (value: number) => void;
  label?: string;
};

export const DebouncedNumInput = ({ id, onChangeId, label = "Title ID" }: DebouncedNumInputProps) => {
  const [inputId, setInputId] = useState(String(id));
  const debouncedSearch = useMemo(
    () =>
      debounce((zId: string) => {
        const nId = parseInt(zId, 10);
        if (!isNaN(nId)) {
          onChangeId(nId);
        }
      }, 500),
    [onChangeId]
  );

  useEffect(() => {
    setInputId(String(id));
  }, [id]);

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputId(nextValue);
    debouncedSearch(nextValue);
  };
  return <TextField
    label={label}
    value={inputId}
    size="small"
    sx={{ width: 100 }}
    // onBlur={(e) => {
    //   const newId = parseInt(e.target.value);
    //   navigate(`/title?mode=${mode}&id=${newId}`);
    // }}
    onChange={handleIdChange}
  ></TextField>;
};

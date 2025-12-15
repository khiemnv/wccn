import { TextField } from "@mui/material";
import debounce from "debounce";
import { useState, useMemo, useEffect } from "react";

// debounce
export const DebouncedNumInput = ({ id, onChangeId }) => {
  const [inputId, setInputId] = useState(id);
  const debouncedSearch = useMemo(() => debounce(
    (zId) => {
      var nId = parseInt(zId);
      if (!isNaN(nId)) {
        onChangeId(nId);
      }
    },
    500), [onChangeId]);

  useEffect(() => {
    setInputId(id);
  }, [id]);

  const handleIdChange = (e) => {
    setInputId(e.target.value);
    debouncedSearch(e.target.value);
  };
  return <TextField
    label="Title ID"
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

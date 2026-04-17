import { useAppSelector } from "../app/hooks";
import { Box, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { changeMode, selectMode } from "../features/search/searchSlice";
import { useDispatch } from "react-redux";

type Mode = "BHH" | "QA";
function HomePage() {
  const dispatch = useDispatch();
  const mode = useAppSelector(selectMode) as Mode;
  return (
   
<Box
  sx={{
    p: 2,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  }}
>
  <FormControl 
size="small"
    sx={{
      width: { xs: "100%", sm: 220, md: 260 },
      maxWidth: "100%",
    }}
>
    <InputLabel id="mode-label">Mode</InputLabel>
    <Select
      labelId="mode-label"
      value={mode}
      label="Mode"
      onChange={(e: SelectChangeEvent<Mode>) => {
        dispatch(changeMode({ mode: e.target.value as Mode }));
      }}
    >
      <MenuItem value="BHH">BHH</MenuItem>
      <MenuItem value="QA">QA</MenuItem>
    </Select>
  </FormControl>
</Box>

  );
}

export default HomePage;

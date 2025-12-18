import {
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { selectSortByDate, setSortByDate, selectMode, changeMode } from "../features/search/searchSlice";
import { MODE_BBH, MODE_QA } from "../constant/strings";

export { default as MenuAppBar } from "./MenuAppBar";
export { ResponsiveAppBar } from "./ResponsiveAppBar";

export function TitleSearchBar({searchStr, onSearch}) {
  const dispatch = useDispatch();
  const sortByDate = useSelector(selectSortByDate);
  const filter = useSelector(selectMode);
  
  return <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
  >
    {/* <Typography variant="h5">Tìm kiếm</Typography> */}

    <Stack direction="row" spacing={1} alignItems="center">
      {/* <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        /><IconButton onClick={handleSearch} title="Reload page chunk">
            <SearchIcon />
          </IconButton> */}
      <CustomizedInputBase searchStr={searchStr} onSearch={onSearch}></CustomizedInputBase>
      <FormControl size="small">
        <InputLabel id="mode-select-label">Mode</InputLabel>
        <Select
          labelId="mode-select-label"
          label="Mode"
          value={filter}
          onChange={(e) => dispatch(changeMode({ mode: e.target.value }))}
        >
          <MenuItem value={MODE_QA}>QA</MenuItem>
          <MenuItem value={MODE_BBH}>BBH</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel id="sort-select-label">Sort</InputLabel>
        <Select
          labelId="sort-select-label"
          label="Sort"
          value={sortByDate}
          onChange={(e) => dispatch(setSortByDate({ sortByDate: e.target.value }))}
        >
          <MenuItem value="dsc">Mới hơn</MenuItem>
          <MenuItem value="asc">Cũ hơn</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  </Stack>;
}

export function CustomizedInputBase({searchStr, onSearch }) {
  const [search, setSearchStr] = useState(searchStr || "");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(search);
    }
  };
  return (
    <Paper
      component="form"
      sx={{ p: "2px 4px", display: "flex", alignItems: "center" }}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(search);
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        inputProps={{ "aria-label": "search" }}
        value={search}
        onChange={(e) => setSearchStr(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <IconButton
        type="button"
        sx={{ p: "6px" }}
        aria-label="search"
        onClick={() => onSearch(search)}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
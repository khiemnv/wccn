import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, selectUsername } from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

function SearchBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUsername);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleClear = () => setQuery("");
  const handleSearch = () => {
    if (!query.trim()) return;
    console.log("🔍 Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return <AppBar position="static">
    <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown} // ✅ Trigger search on Enter
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          minWidth: 250,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }} />
      {/* <Typography variant="body1">{user}</Typography> */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button color="inherit" onClick={() => dispatch(logout())}>
          Đăng xuất
        </Button>
      </Box>
    </Toolbar>
  </AppBar>;
}

export default SearchBar;
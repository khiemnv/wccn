import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, selectRoleObj, selectUsername } from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

function SearchBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUsername);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const roleObj = useAppSelector(selectRoleObj);
  const handleClear = () => setQuery("");
  const handleSearch = () => {
    if (!query.trim()) return;
    console.log("🔍 Searching for:", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };
  const menuItems = [
    { text: "Home", icon: <HomeIcon />, roles: ["admin", "user", "guest"] },
    { text: "Search", icon: <SearchIcon />, roles: ["admin", "user", "guest"] },
    { text: "User Manger", icon: <PeopleIcon />, roles: ["admin"] },
    { text: "Settings", icon: <SettingsIcon />,roles: ["admin"] },
  ];
    // Filter menu items by role
  const userRole = roleObj ? roleObj.sys || "guest" : "guest";
  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );
  // console.log("User Role:", userRole, "Visible Items:", visibleItems);
  const handleMenuClick = (item) => {
    if (item === "Home") {
      navigate("/");
    } else if (item === "User Manger") {
      navigate("/usermanager");
    } else if (item === "Search") {
      navigate("/search");
    } else if (item === "Settings") {
      alert("Open Settings");
    }
    setOpen(false); // close sidebar after click
  };
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          {/* <TextField
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
            }}
          /> */}
          {/* <Typography variant="body1">{user}</Typography> */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" onClick={() => dispatch(logout())}>
              Đăng xuất
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
          {visibleItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleMenuClick(item.text)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}

export default SearchBar;

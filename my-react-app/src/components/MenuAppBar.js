import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, selectRoleObj, selectUsername } from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";

const pages = [
  { text: "Home", icon: <HomeIcon />, url: "/", roles: ["admin", "user", "guest"] },
  { text: "Search", icon: <SearchIcon />, url: "/search", roles: ["admin", "user", "guest"] },
  { text: "User Manger", icon: <PeopleIcon />, url: "/usermanager", roles: ["admin"] },
  { text: "Settings", icon: <SettingsIcon />, roles: ["admin"] },
];

export default function MenuAppBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUsername);
  const navigate = useNavigate();
  const roleObj = useAppSelector(selectRoleObj);
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };
  // Filter menu items by role
  const userRole = roleObj ? roleObj.sys || "guest" : "guest";
  const visibleItems = pages.filter((item) =>
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
          <Typography variant="body1">{user}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" onClick={() => dispatch(logout())} aria-label="logout">
              <LogoutIcon />
            </IconButton>
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

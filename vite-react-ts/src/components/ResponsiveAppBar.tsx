import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import {
  logout,
  selectRoleObj,
  selectUsername,
} from "../features/auth/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { useSelector } from "react-redux";

/** ✅ import image instead of hardcoded path */
import logo from "../assets/chrysanthemum.png";

interface PageItem {
  text: string;
  icon: React.ReactNode;
  url: string;
  roles: string[];
}

const pages: PageItem[] = [
  { text: "Home", icon: <HomeIcon />, url: "/", roles: ["admin", "user", "guest"] },
  { text: "Search", icon: <SearchIcon />, url: "/search", roles: ["admin", "user", "guest"] },
  { text: "Title", icon: <SearchIcon />, url: "/title", roles: ["admin", "user", "guest"] },
  { text: "Tag", icon: <SearchIcon />, url: "/tag", roles: ["admin", "user", "guest"] },
  { text: "User Manager", icon: <PeopleIcon />, url: "/usermanager", roles: ["admin"] },
  { text: "Settings", icon: <SettingsIcon />, url: "/setting", roles: ["admin", "user", "guest"] },
];

export function ResponsiveAppBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /** ✅ proper typing */
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);

  const user = useSelector(selectUsername) ?? "Guest";
  const roleObj = useSelector(selectRoleObj);
  const userRole = roleObj?.sys ?? "guest";

  const availablePages = pages.filter((p) =>
    p.roles.includes(userRole)
  );

  const settings = ["Logout"] as const;
  type Setting = typeof settings[number];

  /** ✅ typed events */
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavMenuItemClick = (page: PageItem) => {
    navigate(page.url);
  };

  const handleUserMenuItemClick = (setting: Setting) => {
    if (setting === "Logout") dispatch(logout());
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* ✅ logo desktop */}
          <Box
            component="img"
            src={logo}
            sx={{ display: { xs: "none", md: "flex" }, mr: 1, height: 32 }}
          />

          <Typography
            variant="h6"
            noWrap
            sx={{ display: { xs: "none", md: "flex" }, fontWeight: 700 }}
          >
            THLC
          </Typography>

          {/* ✅ mobile menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
            <IconButton onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {availablePages.map((page) => (
                <MenuItem
                  key={page.text}
                  onClick={() => {
                    handleCloseNavMenu();
                    handleNavMenuItemClick(page);
                  }}
                >
                  {page.text}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* ✅ logo mobile */}
          <Box
            component="img"
            src={logo}
            sx={{ display: { xs: "flex", md: "none" }, mr: 1, height: 32 }}
          />

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {availablePages.map((page) => (
              <Button
                key={page.text}
                onClick={() => handleNavMenuItemClick(page)}
                sx={{ color: "white" }}
              >
                {page.text}
              </Button>
            ))}
          </Box>

          {/* ✅ user menu */}
          <Tooltip title={user}>
            <IconButton onClick={handleOpenUserMenu}>
              <Avatar>{user[0]?.toUpperCase()}</Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem
                key={setting}
                onClick={() => {
                  handleCloseUserMenu();
                  handleUserMenuItemClick(setting);
                }}
              >
                {setting}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
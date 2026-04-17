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
<AppBar
  position="static"
  elevation={1}
  sx={{
    bgcolor: "primary.main",
    borderBottom: "1px solid",
    borderColor: "rgba(255,255,255,0.12)",
  }}
>
  <Container maxWidth="xl">
    <Toolbar
      disableGutters
      sx={{
        minHeight: 64,
        px: { xs: 1, sm: 2 },
        gap: 1,
      }}
    >
      {/* Desktop logo + title */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          mr: 3,
          gap: 1.25,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="THLC Logo"
          sx={{
            height: 36,
            width: "auto",
            objectFit: "contain",
          }}
        />
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "common.white",
          }}
        >
          THLC
        </Typography>
      </Box>

      {/* Mobile menu button */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
        }}
      >
        <IconButton
          size="large"
          onClick={handleOpenNavMenu}
          color="inherit"
          sx={{
            borderRadius: 2,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorElNav}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
              },
            },
          }}
        >
          {availablePages.map((page) => (
            <MenuItem
              key={page.text}
              onClick={() => {
                handleCloseNavMenu();
                handleNavMenuItemClick(page);
              }}
              sx={{ py: 1, px: 2 }}
            >
              <Typography align="center">{page.text}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Mobile logo + title */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          gap: 1,
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="THLC Logo"
          sx={{
            height: 32,
            width: "auto",
            objectFit: "contain",
          }}
        />
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            fontWeight: 700,
            color: "common.white",
            letterSpacing: 0.3,
          }}
        >
          THLC
        </Typography>
      </Box>

      {/* Desktop nav menu */}
      <Box
        sx={{
          flexGrow: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 0.5,
          minWidth: 0,
        }}
      >
        {availablePages.map((page) => (
          <Button
            key={page.text}
            onClick={() => handleNavMenuItemClick(page)}
            sx={{
              color: "common.white",
              px: 2,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            {page.text}
          </Button>
        ))}
      </Box>

      {/* User menu */}
      <Box sx={{ flexShrink: 0 }}>
        <Tooltip title={user || ""}>
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{
              p: 0,
              ml: 1,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {user?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
              },
            },
          }}
        >
          {settings.map((setting) => (
            <MenuItem
              key={setting}
              onClick={() => {
                handleCloseUserMenu();
                handleUserMenuItemClick(setting);
              }}
              sx={{ py: 1, px: 2 }}
            >
              <Typography align="center">{setting}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Toolbar>
  </Container>
</AppBar>
  );
}
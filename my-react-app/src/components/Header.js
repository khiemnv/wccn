import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, selectUsername } from "../features/auth/authSlice";

const menu = [
  { name: "Trang chủ", path: "/" },
  { name: "Chương trình Tu Tập", path: "/category/chuong-trinh-tu-tap" },
  { name: "Nghi Lễ", path: "/category/nghi-le" },
  { name: "Câu chuyện Chuyển Hóa", path: "/category/cau-chuyen" },
  { name: "Bài Viết Phật Pháp", path: "/category/bai-viet" },
  { name: "Video", path: "/category/video" }
];

function Header() {
    
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUsername);
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body1">{user}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" onClick={() => dispatch(logout())}>
              Đăng xuất
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <header style={styles.header}>
        <h1 style={{ margin: "0", color: "#fff" }}>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            PHẠM THỊ YẾN
          </Link>
        </h1>
        <nav style={styles.nav}>
          {menu.map((item) => (
            <Link key={item.path} to={item.path} style={styles.link}>
              {item.name}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

const styles = {
  header: {
    background: "#4CAF50",
    padding: "15px",
    textAlign: "center"
  },
  nav: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  }
};

export default Header;

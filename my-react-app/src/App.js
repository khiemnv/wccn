import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import { useAppSelector } from "./app/hooks";
import { selectRoleObj, selectToken, selectUsername } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import SearchBar from "./components/SearchBar";
import { useMediaQuery } from "@mui/material";
import UserManager from "./pages/UserManagerPage";
import Bai8 from "./pages/Bai8";

function App() {
  const token = useAppSelector(selectToken);
  const email = useAppSelector(selectUsername);
  const isMobile = useMediaQuery('(max-width:600px)');
  const roleObj = useAppSelector(selectRoleObj);
  if (!token) {
    return <LoginPage></LoginPage>;
  }

  return (
    <div>
      <SearchBar />
      {/* <Header /> */}
      <main style={{ padding: isMobile ? "0px" : "20px", minHeight: "70vh" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wccn" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/Bai8" element={<Bai8 />} />          

          {roleObj && roleObj.sys === "admin" && <Route path="/usermanager" element={<UserManager />} />}
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;

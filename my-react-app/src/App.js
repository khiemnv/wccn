import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import { useAppSelector } from "./app/hooks";
import { selectRoleObj, selectToken } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import { ResponsiveAppBar } from "./components/SearchBar";
import { Box, useMediaQuery } from "@mui/material";
import UserManager from "./pages/UserManagerPage";
import Bai8 from "./pages/Bai8";
import { TitlePage } from "./pages/TitlePage";
import TagPage from "./pages/TagPage";

import { useEffect } from "react";

export function useMobileVh() {
  useEffect(() => {
    function updateVh() {
      const vh = window.visualViewport
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01;

      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    updateVh();

    window.visualViewport?.addEventListener("resize", updateVh);
    window.addEventListener("resize", updateVh);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateVh);
      window.removeEventListener("resize", updateVh);
    };
  }, []);
}


function App() {
  // useMobileVh();

  const token = useAppSelector(selectToken);
  const isMobile = useMediaQuery('(max-width:600px)');
  const roleObj = useAppSelector(selectRoleObj);
  if (!token) {
    return <LoginPage></LoginPage>;
  }

  return (
    <Box sx={{display:"flex", flexDirection: "column", height: "50vh", flexGrow: 1}}>
      <ResponsiveAppBar />
      {/* <Header /> */}
      <main style={{ minHeight: "50vh", display:"flex", flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wccn" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/Bai8" element={<Bai8 />} />
          <Route path="/Title" element={<TitlePage />} />
          <Route path="/Tag" element={<TagPage />} />

          {roleObj && roleObj.sys === "admin" && <Route path="/usermanager" element={<UserManager />} />}
        </Routes>
      </main>
      {/* <Footer /> */}
    </Box>
  );
}

export default App;

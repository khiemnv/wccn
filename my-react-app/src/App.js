import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import { useAppSelector, useTagsSubscription } from "./app/hooks";
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
import { db } from "./firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { selectTags, setTags } from "./features/search/searchSlice";
import { getAllTags } from "./services/search/keyApi";
import SettingsPage from "./pages/SettingsPage";

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
  console.log("App render");
  useMobileVh();

  // All available tags (from API or from store) used to suggest options
  const dispatch = useDispatch();
  const rawTags = useSelector(selectTags);

  useEffect(() => {
    async function loadTags() {
      try {
        console.log("Loading all tags...");
        const { result, error } = await getAllTags();
        if (result) {
          dispatch(setTags({ tags: result }));
        } else {
          console.error("Error loading tags from API:", error);
        }
      } catch (err) {
        console.error("Error loading tags:", err);
      }
    }
    if (!rawTags) {
      loadTags();
    }
  }, [rawTags, dispatch]);

  useTagsSubscription(db, null);

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
          <Route path="/bai8" element={<Bai8 />} />
          <Route path="/title" element={<TitlePage />} />
          <Route path="/tag" element={<TagPage />} />
          <Route path="/setting" element={<SettingsPage />} />

          {roleObj && roleObj.sys === "admin" && <Route path="/usermanager" element={<UserManager />} />}
        </Routes>
      </main>
      {/* <Footer /> */}
    </Box>
  );
}

export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import { useAppSelector } from "./app/hooks";
import { selectToken, selectUsername } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import SearchBar from "./components/SearchBar";

function App() {
  const token = useAppSelector(selectToken);
  const email = useAppSelector(selectUsername);
  if (!token) {
    return <LoginPage></LoginPage>;
  }

  return (
    <div>
      <SearchBar />
      {/* <Header /> */}
      <main style={{ padding: "20px", minHeight: "70vh" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/post/:slug" element={<PostDetail />} />
         <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;

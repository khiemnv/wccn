import { useEffect } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { useAppSelector } from "./app/hooks";
import { selectToken } from "./features/auth/authSlice";
import { selectTags, setTags } from "./features/search/searchSlice";
import { getAllTags } from "./services/search/keyApi";
import LoginPage from "./pages/LoginPage";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import { Box, createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";


function App() {
  console.log("App render");

  const dispatch = useDispatch();
  const rawTags = useSelector(selectTags);
  const token = useAppSelector(selectToken);

  useEffect(() => {
    if (!token) return;

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
  }, [rawTags, dispatch, token]);

  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = createTheme({
    spacing: isMobile ? 8 : 16,
    components: {
      MuiCard: { // Target the Card component
        styleOverrides: {
          root: {
            // // Apply padding that uses theme breakpoints
            // padding: '16px', // default padding
            // '@media (min-width: 600px)': { // sm breakpoint
            //   padding: '8px',
            // },
            // '@media (min-width: 900px)': { // md breakpoint
            //   padding: '24px',
            // },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            // size: isMobile ? "small" : "medium"
          }
        }
      }
      // You can add overrides for other components here (e.g., MuiButton, MuiPaper)


    },
  });

return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh", // ✅ full page height
        }}
      >
        {token && <ResponsiveAppBar />}

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {!token ? (
              <Route path="*" element={<LoginPage />} />
            ) : (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
              </>
            )}
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );

}

export default App;

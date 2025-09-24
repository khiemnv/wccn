import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import wordData from "../data/word.json";
import { useDispatch, useSelector } from "react-redux";
import {
  addKey,
  addTitle,
  selectKeysByIds,
  selectTitlesByIds,
} from "../features/search/searchSlice";
import { getKey, getTitle } from "../services/search/keyApi";
import {
  Box,
  Typography,
  Paper,
  Pagination,
  Stack,
  CircularProgress,
  Chip,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Collapse,
  CardHeader,
} from "@mui/material";
import HighlightWords from "./HighlightWords";

const CHUNK_SIZE = 10; // should match how files were generated
const MAX_POSSIBLE_CHUNKS = 200; // safety limit; adjust if you expect more

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// data = [{ word: string, titles: string[] }]
function findTitlesForSearch(keys) {
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // console.log(key.titles);
    const titles = key.titles;
    titles.forEach((t) => {
      if (!map.has(t.titleId)) {
        map.set(t.titleId, [t]);
      } else {
        map.get(t.titleId).push(t);
      }
    });
  }

  return Array.from(map.values()).filter((arr) => arr.length === keys.length);
}

export default function SearchPage() {
  const query = useQuery().get("q");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [chunkData, setChunkData] = useState([]);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [totalPages, setTotalPages] = useState(null); // unknown until we detect missing file
  const [search, setSearch] = useState("");
  const [filterKeyId, setFilterKeyId] = useState("");
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Find title sets for each word
  const words = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  const keyIds = words
    .map((word) => parseInt(wordData[word]))
    .filter(Boolean)
    .sort((a, b) => a - b);
  const keys = useSelector(selectKeysByIds(keyIds));
  console.log("keys ", keyIds.join(","), ":");
  console.log(
    keys.map((k) => `${k.word}: ${k.titles.length} titles`).join("\n")
  );

  const rows = findTitlesForSearch(keys);
  // console.log("Search results for", query, ":", rows );

  const view = rows.slice((page - 1) * CHUNK_SIZE, page * CHUNK_SIZE);
  // console.log("view:", view);
  const titleIds = view.map((v) => v[0].titleId).sort((a, b) => a - b);
  const titles = useSelector(selectTitlesByIds(titleIds));
  console.log("titles ", titleIds.join(","), ":");
  console.log(titles.map((t) => t.path + " " + t.title).join("\n"));
  useEffect(() => {
    const loadKeys = async () => {
      for (let i = 0; i < keyIds.length; i++) {
        const key = keys.find((k) => k.keyId === keyIds[i]);
        if (!key) {
          const { result } = await getKey(keyIds[i].toString());
          if (result) {
            dispatch(addKey({ key: result }));
          }
        }
      }
      setLoaded(true);
    };

    loadKeys();
  }, [dispatch, keyIds.join(",")]);

  useEffect(() => {
    async function loadTitles() {
      for (let i = 0; i < view.length; i++) {
        const titleId = view[i][0].titleId;
        const title = titles.find((t) => t.titleId === titleId);
        if (!title) {
          const { result } = await getTitle(titleId.toString());
          if (result) {
            dispatch(addTitle({ title: result }));
          }
        }
      }
      setLoadingTitle(false);
    }
    loadTitles();
  }, [page, titleIds.join(",")]);

  if (!loaded) {
    return <div>Loading...</div>;
  }
  const handleChangePage = (e, value) => {
    setPage(value);
  };
  const handleRefresh = () => setRefreshTick((t) => t + 1);
  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      {/* <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h5">Tìm kiếm</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Search"
            value={query}
            onChange={(e) => navigate(`/search?q=${encodeURIComponent(query)}`)}
            size="small"
          />
          <TextField
            label="Filter TitleId"
            value={filterKeyId}
            onChange={(e) => setFilterKeyId(e.target.value)}
            size="small"
            sx={{ width: 120 }}
          />
          <IconButton onClick={handleRefresh} title="Reload page chunk">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack> */}

      <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Stack
          sx={{ paddingBottom: 1 }}
          direction={false ? "column" : "row"}
          spacing={2}
          alignItems={isMobile ? "stretch" : "center"}
        >
          <Typography variant={isMobile ? "body1" : "h6"}>Page</Typography>
          <Pagination
            count={totalPages === null ? Math.max(page + 3, 10) : totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            size={isMobile ? "small" : "medium"}
          />
          <Typography>
            <strong>{rows.length}</strong> results
          </Typography>
          {loadingTitle && <CircularProgress size={CHUNK_SIZE} />}
          {error && <Typography color="error">Error: {error}</Typography>}
        </Stack>
        <Grid container spacing={isMobile ? 1 : 2}>
          {(titles || []).map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.titleId}>
              <Title2 t={t} isMobile={isMobile} words={words}></Title2>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
function renderTitle(t, isMobile, words) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={`titleId: ${t.titleId}`}
          size={isMobile ? "small" : "medium"}
        />
        <Typography variant="body2" fontWeight="bold">
          {t.path}
        </Typography>
      </Stack>
      {t.paragraphs && (
        <Stack sx={{ pl: 4 }} spacing={0.5}>
          {t.paragraphs.map((s, idx) => (
            <Typography key={idx} variant="caption" color="text.secondary">
              • <HighlightWords text={s} words={words} />
            </Typography>
          ))}
        </Stack>
      )}
    </Box>
  );
}
function Title2({ t, isMobile, words }) {
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => setExpanded((prev) => !prev);
  return (
    <Card
      variant="outlined"
      sx={{ mb: 2, width: isMobile ? "100%" : "auto", boxSizing: "border-box" }}
    >
      <CardHeader title={t.path} subheader={`ID: ${t.titleId}`}></CardHeader>
      <CardContent>
        <Typography variant="h6">
          {t.title.replace(/Question|cau/, "Câu")}
        </Typography>
      </CardContent>
      <CardActions>
        <Box sx={{ width: "100%", textAlign: "left" }}>
          <Button size="small" onClick={handleExpandClick}>
            {expanded ? "Ẩn chi tiết" : "Chi tiết"}
          </Button>
        </Box>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {t.paragraphs && (
            <Stack spacing={0.5}>
              {t.paragraphs
                .map((p) =>
                  p
                    .trim()
                    .replace("question", "Câu hỏi")
                    .replace("answer", "CCN chỉ dạy")
                )
                .filter((p) => p !== "")
                .map((s, idx) => (
                  <Typography
                    key={idx}
                    variant="caption"
                    color="text.secondary"
                  >
                    •{" "}
                    <HighlightWords
                      text={s.replace(/^[-\s]+/, "")}
                      words={words}
                    />
                  </Typography>
                ))}
            </Stack>
          )}
        </CardContent>
        {expanded && (
          <Box sx={{ textAlign: "left", mt: 1, ml: 1 }}>
            <Button size="small" onClick={handleExpandClick}>
              Ẩn chi tiết
            </Button>
          </Box>
        )}
      </Collapse>
    </Card>
  );
}

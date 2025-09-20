import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import wordData from "../data/word.json";
import { useDispatch, useSelector } from "react-redux";
import { addKey, addTitle, selectKeysByIds, selectTitlesByIds } from "../features/search/searchSlice";
import { getKey, getTitle } from "../services/search/keyApi";
import {
  Box,
  Typography,
  Paper,
  Pagination,
  Stack,
  CircularProgress,
  Chip,
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
  console.log(keys.map(k=>`${k.word}: ${k.titles.length} titles`).join("\n"));

  const rows  = findTitlesForSearch(keys);
  // console.log("Search results for", query, ":", rows );

  const view = rows.slice((page - 1) * CHUNK_SIZE, page * CHUNK_SIZE);
  // console.log("view:", view);
  const titleIds = view.map((v) => v[0].titleId).sort((a, b) => a - b);
  const titles = useSelector(selectTitlesByIds(titleIds));
  console.log("titles ", titleIds.join(","), ":");
  console.log(titles.map(t=>t.path + " " + t.title).join("\n"));
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
      for ( let i = 0; i < view.length; i++) {
        const titleId = view[i][0].titleId;
        const title = titles.find((t) => t.titleId === titleId);
        if (!title) {
          const {result} = await getTitle(titleId.toString());
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
    <Box sx={{ p: 3 }}>
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

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>Page</Typography>
          <Pagination
            count={totalPages === null ? Math.max(page + 3, 10) : totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
          <Typography>
            <strong>{rows.length}</strong> results
          </Typography>
          {loadingTitle && <CircularProgress size={CHUNK_SIZE} />}
          {error && <Typography color="error">Error: {error}</Typography>}
        </Stack>
        <Stack spacing={1}>
          {(titles || []).map((t) => (
            <Box key={t.titleId} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`titleId: ${t.titleId}`} size="small" />
                <Typography variant="body2" fontWeight="bold">{t.path}</Typography>
                {/* <Typography variant="body2" color="text.secondary">count: {t.count}</Typography> */}
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
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

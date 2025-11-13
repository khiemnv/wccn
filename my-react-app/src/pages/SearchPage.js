import { use, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import qaWords from "../data/qaWords.json";
import bbhWords from "../data/bbhWords.json";
import { useDispatch, useSelector } from "react-redux";
import {
  addKey,
  addTitle,
  selectKeysByIds,
  selectMode,
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
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import HighlightWords from "./HighlightWords";
import { set } from "firebase/database";
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from "@mui/icons-material/Search";

const CHUNK_SIZE = 10; // should match how files were generated
const MAX_POSSIBLE_CHUNKS = 200; // safety limit; adjust if you expect more

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// in_keys = [{ word: string, titles: [{titleId:int, paras:[]}] }]
function findTitlesForSearch(keys) {
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const titles = key.titles;
    titles.forEach((t) => {
      if (!map.has(t.titleId)) {
        map.set(t.titleId, [t]);
      } else {
        map.get(t.titleId).push(t);
      }
    });
  }

  const threshold = 10*keys.length; // adjust as needed

  const calcDiff = (arr) => {
    let d = 0;
    var paths = [];
    arr[0].paras.forEach((p) => {
      p.pos.forEach((pos) => {
        paths.push({
          arr: [{ paraId: p.paraId, pos: pos }],
          d: 0,
        });
      });
    });
    for (let i = 1; i < arr.length; i++) {
      paths = paths.filter((path) => {
        var temp = undefined; 
        arr[i].paras.forEach((para) => {
          para.pos.forEach((pos) => {
            var diff = Math.min(
              ...path.arr.map(
                (x) =>
                  Math.abs(x.paraId - para.paraId) * 100 +
                  Math.abs(x.pos - pos)
              )
            );
            if (diff < threshold) { // threshold
              if ((!temp) || (diff < temp.d)) {
                temp = {
                  w: { paraId: para.paraId, pos: pos },
                  d: diff,
                };
              }
            }
          });
        });
        if (!temp) {
          return false;
        } else {
          path.arr.push(temp.w);
          path.d = temp.d;
          return true;
        }
      });

      if (paths.length === 0) {
        return Infinity;
      }    
    }
    
    d = Math.min(...paths.map(p=>p.d));
    return d;
  }

  var grp = Array.from(map.values()).filter((arr) => arr.length === keys.length);
  var titles = grp.map(arr => ({titleId: arr[0].titleId, d: calcDiff(arr), arr}))
  return titles.filter(t => t.d < threshold).sort((a,b) => a.d - b.d);
}

export default function SearchPage() {
  const query = useQuery().get("q");
  const mode = useQuery().get("mode") || "QA";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  // const mode = useSelector(selectMode);

  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [chunkData, setChunkData] = useState([]);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [totalPages, setTotalPages] = useState(null); // unknown until we detect missing file
  const [search, setSearch] = useState(query || "");
  const [filter, setFilter] = useState("QA");
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rows, setRows] = useState([]);

  // Find title sets for each word
  const words = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  const keyIdToWord = {};
  const wordData = mode === "QA" ? qaWords : bbhWords;
  const keyIds = words
    .map((word) => {var keyId = parseInt(wordData[word]); keyIdToWord[keyId] = word; return keyId;})
    .filter(Boolean)
    .sort((a, b) => a - b);
  const keys = useSelector(state => selectKeysByIds(state, mode, keyIds));
  console.log("keys ", keyIds.join(","), ":");
  console.log(
    keys.map((k) => `${k.word}: ${k.titles.length} titles`).join("\n")
  );

  // console.log("Search results for", query, ":", rows );

  const view = rows.slice((page - 1) * CHUNK_SIZE, page * CHUNK_SIZE);
  console.log("view:", view);
  const titleIds = view.map((v) => v.titleId).sort((a, b) => a - b);
  const titles = useSelector(state => selectTitlesByIds(state, mode, titleIds));
  console.log("titles ", titleIds.join(","), ":");
  console.log(titles.map((t) => t.path + " " + t.title).join("\n"));
  useEffect(() => {
    setFilter(mode);
    setSearch(query);
  }, [mode, query]);
  useEffect(() => {
    const loadKeys = async () => {
      for (let i = 0; i < keyIds.length; i++) {
        const key = keys.find((k) => k.keyId === keyIds[i]);
        if (!key) {
          var keyId = keyIds[i];
          const { result } = await getKey(keyId, mode);
          if (result) {
            dispatch(addKey({ key: {word: keyIdToWord[keyId], ...result}, mode:mode }));
          }
        }
      }

      setLoaded(true);
    };

    loadKeys();
  }, [mode, keyIds.join(",")]);

  useEffect(() => {
    async function loadTitles() {
      for (let i = 0; i < view.length; i++) {
        const titleId = view[i].titleId;
        const title = titles.find((t) => t.titleId === titleId);
        if (!title) {
          const { result } = await getTitle(titleId.toString(), mode);
          if (result) {
            dispatch(addTitle({ title: result, mode:mode }));
          }
        }
      }
      setLoadingTitle(false);
    }
    loadTitles();
  }, [page, mode, titleIds.join(",")]);

  useEffect(() => {
    if (keys.length === keyIds.length) {
      var rows = findTitlesForSearch(keys);
      setRows(rows);
      setTotalPages(Math.ceil(rows.length / CHUNK_SIZE));
    }
  },[mode, keys.map(k=>k.keyId).join(",")]);

  if (!loaded) {
    return <div>Loading...</div>;
  }
  const handleChangePage = (e, value) => {
    setPage(value);
  };
  const handleSearch = () => navigate(`/search?q=${encodeURIComponent(search)}&mode=${filter}`);
  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2}
        mt = {2}
      >
        {/* <Typography variant="h5">Tìm kiếm</Typography> */}

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel id="mode-select-label">Mode</InputLabel>
            <Select
              labelId="mode-select-label"
              label="Mode"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="QA">QA</MenuItem>
              <MenuItem value="BBH">BBH</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleSearch} title="Reload page chunk">
            <SearchIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Paper
        elevation={2}
        sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 }, mt: { xs: 1, sm: 2 } }}
      >
        <Stack
          sx={{ paddingBottom: 1 }}
          direction={false ? "column" : "row"}
          spacing={isMobile ? 1 : 2}
          alignItems={isMobile ? "stretch" : "center"}
        >
          {isMobile || <Typography variant={isMobile ? "body1" : "h6"}>Page</Typography>}
          <Pagination
            count={totalPages === null ? Math.max(page + 3, 10) : totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            size={isMobile ? "small" : "medium"}
          />
          {isMobile || <Typography><strong>{rows.length}</strong> results</Typography>}
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
      sx={{
        mb: isMobile ? 0 : 1,
        width: isMobile ? "100%" : "auto",
        boxSizing: "border-box",
      }}
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

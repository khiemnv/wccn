import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import qaWords from "../data/qaWords.json";
import bbhWords from "../data/bbhWords.json";
import { useDispatch, useSelector } from "react-redux";
import {
  addKey,
  addTitle,
  selectKeysByIds,
  selectMode,
  selectSortByDate,
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
  useMediaQuery,
  Grid,
} from "@mui/material";

import TitleCard from "../components/TitleCard";
import { TitleSearchBar } from "../components/SearchBar";

const CHUNK_SIZE = 10; // should match how files were generated

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

  const threshold = 10 * keys.length; // adjust as needed

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
                  Math.abs(x.paraId - para.paraId) * 100 + Math.abs(x.pos - pos)
              )
            );
            if (diff < threshold) {
              // threshold
              if (!temp || diff < temp.d) {
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

    d = Math.min(...paths.map((p) => p.d));
    return d;
  };

  var grp = Array.from(map.values()).filter(
    (arr) => arr.length === keys.length
  );
  var titles = grp.map((arr) => ({
    titleId: arr[0].titleId,
    d: calcDiff(arr),
    arr,
  }));
  return titles.filter((t) => t.d < threshold).sort((a, b) => a.d - b.d);
}
export default function SearchPage() {
  const query = useQuery().get("q");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  // const mode = useSelector(selectMode);

  const [loaded, setLoaded] = useState(false);
  const sortByDate = useSelector(selectSortByDate);
  const mode = useSelector(selectMode);
  const [sortedRows, setSortedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [chunkData, setChunkData] = useState([]);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [totalPages, setTotalPages] = useState(null); // unknown until we detect missing file
  const [search, setSearch] = useState(query || "");
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rows, setRows] = useState([]);

  // Find title sets for each word
  const words = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  const keyIdToWord = {};
  const wordData = mode === "QA" ? qaWords : bbhWords;
  const keyIds = words
    .map((word) => {
      var keyId = parseInt(wordData[word]);
      keyIdToWord[keyId] = word;
      return keyId;
    })
    .filter(Boolean)
    .sort((a, b) => a - b);
  const keys = useSelector((state) => selectKeysByIds(state, mode, keyIds));
  console.log("keys ", keyIds.join(","), ":");
  console.log(
    keys.map((k) => `${k.word}: ${k.titles.length} titles`).join("\n")
  );

  // console.log("Search results for", query, ":", rows );

  const view = sortedRows.slice((page - 1) * CHUNK_SIZE, page * CHUNK_SIZE);
  console.log("view:", view);
  const titleIds = view.map((v) => v.titleId);
  const titles = useSelector((state) =>
    selectTitlesByIds(state, mode, titleIds)
  ).sort((a, b) =>
    sortByDate === "asc" ? a.titleId - b.titleId : b.titleId - a.titleId
  );
  console.log("titles ", titleIds.join(","), ":");
  console.log(titles.map((t) => t.path + " " + t.title).join("\n"));
  useEffect(() => {
    // dispatch(changeMode({ mode }));
    setSearch(query);
  }, [mode, query, dispatch]);
  useEffect(() => {
    const loadKeys = async () => {
      for (let i = 0; i < keyIds.length; i++) {
        const key = keys.find((k) => k.keyId === keyIds[i]);
        if (!key) {
          var keyId = keyIds[i];
          const { result } = await getKey(keyId, mode);
          if (result) {
            dispatch(
              addKey({
                key: { word: keyIdToWord[keyId], ...result },
                mode: mode,
              })
            );
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
            dispatch(addTitle({ title: result, mode: mode }));
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
  }, [mode, keys.map((k) => k.keyId).join(",")]);

  useEffect(() => {
    var sorted = rows.sort((a, b) =>
      sortByDate === "asc" ? a.titleId - b.titleId : b.titleId - a.titleId
    );
    setSortedRows(sorted);
  }, [sortByDate, rows]);

  if (!loaded) {
    return <div>Loading...</div>;
  }
  const handleChangePage = (e, value) => {
    setPage(value);
  };
  const handleSearch = (searchStr) =>
    navigate(`/search?q=${encodeURIComponent(searchStr)}`);
  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <TitleSearchBar onSearch={handleSearch}/>

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
          {isMobile || (
            <Typography variant={isMobile ? "body1" : "h6"}>Page</Typography>
          )}
          <Pagination
            count={totalPages === null ? Math.max(page + 3, 10) : totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            size={isMobile ? "small" : "medium"}
          />
          {isMobile || (
            <Typography>
              <strong>{rows.length}</strong> results
            </Typography>
          )}
          {loadingTitle && <CircularProgress size={CHUNK_SIZE} />}
          {error && <Typography color="error">Error: {error}</Typography>}
        </Stack>
        <Grid container spacing={isMobile ? 1 : 2}>
          {(titles || []).map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.titleId}>
              <TitleCard t={t} isMobile={isMobile} words={words}></TitleCard>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}


import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import qaWords from "../data/qaWords.json";
import bbhWords from "../data/bbhWords.json";
import { useDispatch, useSelector } from "react-redux";
import {
  addKey,
  addTitle,
  changeSearchPage,
  changeSearchStr,
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
import { useMemo } from "react";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  // const mode = useSelector(selectMode);
  const storeSeachStr = useSelector((state) => state.search.searchStr);
  const storeSearchPage = useSelector((state) => state.search.searchPage);

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") ? params.get("q") : storeSeachStr;
  if (query !== storeSeachStr) {
    dispatch(changeSearchStr({ searchStr: query }));
    dispatch(changeSearchPage({ searchPage: 1 }));
  }

  const [loaded, setLoaded] = useState(false);
  const sortByDate = useSelector(selectSortByDate);
  const mode = useSelector(selectMode);
  const [sortedRows, setSortedRows] = useState([]);
  const [page, setPage] = [
    storeSearchPage,
    (newPage) => dispatch(changeSearchPage({ searchPage: newPage })),
  ];
  const [chunkData, setChunkData] = useState([]);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [totalPages, setTotalPages] = useState(null); // unknown until we detect missing file
  const [search, setSearch] = useState(query || "");
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rows, setRows] = useState([]);

  // Find title sets for each word
  const wordData = mode === "QA" ? qaWords : bbhWords;
  const { keyIdToWord, keyIds, words } = useMemo(() => {
    const words = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
    const map = {};
    const ids = words
      .map((word) => {
        const keyId = parseInt(wordData[word]);
        if (keyId) map[keyId] = word;
        return keyId;
      })
      .filter(Boolean)
      .sort((a, b) => a - b);
    return { keyIdToWord: map, keyIds: ids, words };
  }, [query, wordData]);
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


  // prepare stable dependency primitives for the effect
  const keyIdsStr = keyIds.join(",");
  const loadedKeyIdsStr = keys.map((k) => k.keyId).join(",");

  useEffect(() => {
    // Parse stable string deps into arrays to avoid referencing complex objects
    const keyIdsArr = keyIdsStr.split(",").map((s) => parseInt(s, 10));
    const existingKeyIds = new Set(loadedKeyIdsStr.split(",").map((s) => parseInt(s, 10)));
    const missingKeyIds = keyIdsArr.filter((id) => !existingKeyIds.has(id));

    if (missingKeyIds.length === 0) {
      setLoaded(true);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoaded(false);
        const results = await Promise.all(
          missingKeyIds.map((id) => getKey(id, mode))
        );
        for (let i = 0; i < results.length; i++) {
          if (!mounted) break;
          const res = results[i];
          const keyId = missingKeyIds[i];
          if (res && res.result) {
            dispatch(
              addKey({ key: { word: keyIdToWord[keyId] || "", ...res.result }, mode: mode })
            );
          }
        }
      } catch (err) {
        // ignore, we'll mark loaded in finally
      } finally {
        if (mounted) setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mode, keyIdsStr, loadedKeyIdsStr, keyIdToWord, dispatch]);


  // compute which ids are still missing from store
  const missingIds = useMemo(() => {
    if (!Array.isArray(titles)) return titleIds.slice();
    return titleIds.filter((id) => !titles.some((t) => t.titleId === id));
  }, [titleIds, titles]);

  const missingIdsStr = missingIds.join(",");

  useEffect(() => {
    const ids = missingIdsStr ? missingIdsStr.split(",").filter(Boolean).map((s) => parseInt(s, 10)) : [];
    if (ids.length === 0) {
      setLoadingTitle(false);
      return;
    }

    let mounted = true;
    setLoadingTitle(true);

    (async () => {
      try {
        // fetch all missing titles in parallel
        const results = await Promise.all(ids.map((id) => getTitle(id.toString(), mode)));

        // dispatch each successful result
        for (const res of results) {
          if (!mounted) break;
          if (res && res.result) {
            dispatch(addTitle({ title: res.result, mode }));
          }
        }
      } finally {
        if (mounted) setLoadingTitle(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [missingIdsStr, mode, dispatch]);

  useEffect(() => {
    const keyIdsArr = keyIdsStr ? keyIdsStr.split(",").filter(Boolean).map((s) => parseInt(s, 10)) : [];
    const keysArr = keys || [];
    if (keysArr.length === keyIdsArr.length) {
      var rows = findTitlesForSearch(keysArr);
      setRows(rows);
      setTotalPages(Math.ceil(rows.length / CHUNK_SIZE));
    }
  }, [mode, keys, keyIdsStr]);

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
      <TitleSearchBar searchStr={search} onSearch={handleSearch} />

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


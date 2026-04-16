import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import qaWords from "../data/qaWords.json";
import bbhWords from "../data/bbhWords.json";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
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
  CircularProgress,
  useMediaQuery,
} from "@mui/material";

import TitleCard from "../components/TitleCard";
import { TitleSearchBar } from "../components/SearchBar";

const CHUNK_SIZE = 10; // should match how files were generated

type WordPara = {
  paraId: number;
  pos: number[];
};

type PathItem = {
  paraId: number;
  pos: number;
};

type WordTitleMatch = {
  titleId: number;
  paras: WordPara[];
};

type SearchKey = {
  keyId: number;
  word: string;
  titles: WordTitleMatch[];
};

type SearchResultRow = {
  titleId: number;
  d: number;
  arr: WordTitleMatch[];
};

type TitleItem = {
  titleId: number;
  title: string;
  path: string;
  [key: string]: unknown;
};

function findTitlesForSearch(keys: SearchKey[]): SearchResultRow[] {
  const map = new Map<number, WordTitleMatch[]>();
  for (const key of keys) {
    for (const match of key.titles) {
      const existing = map.get(match.titleId);
      if (existing) {
        existing.push(match);
      } else {
        map.set(match.titleId, [match]);
      }
    }
  }

  const threshold = 10 * keys.length;

  const calcDiff = (arr: WordTitleMatch[]) => {
    const paths: Array<{ arr: PathItem[]; d: number }> = [];
    arr[0].paras.forEach((p) => {
      p.pos.forEach((pos) => {
        paths.push({ arr: [{ paraId: p.paraId, pos }], d: 0 });
      });
    });

    let currentPaths = paths;
    for (let i = 1; i < arr.length; i++) {
      const nextParas = arr[i].paras;
      const filteredPaths: Array<{ arr: PathItem[]; d: number }> = [];

      for (const path of currentPaths) {
        let bestMatch: { d: number; w: PathItem } | null = null;
        for (const para of nextParas) {
          for (const pos of para.pos) {
            const diff = Math.min(
              ...path.arr.map((x) => Math.abs(x.paraId - para.paraId) * 100 + Math.abs(x.pos - pos))
            );
            if (diff < threshold && (!bestMatch || diff < bestMatch.d)) {
              bestMatch = { d: diff, w: { paraId: para.paraId, pos } };
            }
          }
        }
        if (bestMatch !== null) {
          filteredPaths.push({ arr: [...path.arr, bestMatch.w], d: bestMatch.d });
        }
      }

      if (filteredPaths.length === 0) {
        return Infinity;
      }
      currentPaths = filteredPaths;
    }

    return Math.min(...currentPaths.map((p) => p.d));
  };

  const rows = Array.from(map.values())
    .filter((arr) => arr.length === keys.length)
    .map((arr) => ({
      titleId: arr[0].titleId,
      d: calcDiff(arr),
      arr,
    }));

  return rows.filter((row) => row.d < threshold).sort((a, b) => a.d - b.d);
}

export default function SearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const storeSearchStr = useSelector((state: RootState) => state.search.searchStr);
  const storeSearchPage = useSelector((state: RootState) => state.search.searchPage);

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") ?? storeSearchStr;

  useEffect(() => {
    if (query !== storeSearchStr) {
      dispatch(changeSearchStr({ searchStr: query }));
      dispatch(changeSearchPage({ searchPage: 1 }));
    }
  }, [query, storeSearchStr, dispatch]);

  const [loaded, setLoaded] = useState(false);
  const sortByDate = useSelector((state: RootState) => selectSortByDate(state));
  const mode = useSelector((state: RootState) => selectMode(state));
  const [sortedRows, setSortedRows] = useState<SearchResultRow[]>([]);
  const [rows, setRows] = useState<SearchResultRow[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [search, setSearch] = useState(query || "");

  // Find title sets for each word
  const wordData = mode === "QA" ? qaWords : bbhWords;
  const { keyIdToWord, keyIds, words } = useMemo(() => {
    const normalizedWords = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
    const map: Record<number, string> = {};
    const ids = normalizedWords
      .map((word) => {
        const keyIdRaw = (wordData as Record<string, string | number>)[word];
        const keyId = keyIdRaw ? parseInt(String(keyIdRaw), 10) : NaN;
        if (!Number.isNaN(keyId)) {
          map[keyId] = word;
          return keyId;
        }
        return NaN;
      })
      .filter((id): id is number => !Number.isNaN(id))
      .sort((a, b) => a - b);
    return { keyIdToWord: map, keyIds: ids, words: normalizedWords };
  }, [query, wordData]);

  const keys = useSelector<RootState, SearchKey[]>((state) => selectKeysByIds(state, mode, keyIds));
  console.log("keys ", keyIds.join(","), ":");
  console.log(
    keys
      .map((k) => `${k.word}: ${k.titles.length} titles`)
      .join("\n")
  );

  // console.log("Search results for", query, ":", rows );

  const page = storeSearchPage;
  const view = sortedRows.slice((page - 1) * CHUNK_SIZE, page * CHUNK_SIZE);
  console.log("view:", view);
  const titleIds = view.map((v) => v.titleId);
  const titles = useSelector<RootState, TitleItem[]>((state) => selectTitlesByIds(state, mode, titleIds));
  const sortedTitles = useMemo<TitleItem[]>(() => {
    return [...titles].sort((a, b) =>
      sortByDate === "asc" ? a.titleId - b.titleId : b.titleId - a.titleId
    );
  }, [sortByDate, titles]);
  console.log("titles ", titleIds.join(","), ":");
  console.log(sortedTitles.map((t) => t.path + " " + t.title).join("\n"));


  useEffect(() => {
    // dispatch(changeMode({ mode }));
    setSearch(query);
  }, [mode, query, dispatch]);


  // prepare stable dependency primitives for the effect
  const keyIdsStr = keyIds.join(",");
  const loadedKeyIdsStr = keys.map((k) => k.keyId).join(",");

  useEffect(() => {
    // Parse stable string deps into arrays to avoid referencing complex objects
    const keyIdsArr = keyIdsStr
      ? keyIdsStr.split(",").filter(Boolean).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n))
      : [];
    const existingKeyIds = new Set(
      loadedKeyIdsStr
        .split(",")
        .filter(Boolean)
        .map((s) => parseInt(s, 10))
        .filter((n) => !Number.isNaN(n))
    );
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
      } catch {
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
    const keyIdsArr = keyIdsStr
      ? keyIdsStr.split(",").filter(Boolean).map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n))
      : [];
    const keysArr = keys || [];
    if (keysArr.length === keyIdsArr.length) {
      const rows = findTitlesForSearch(keysArr);
      setRows(rows);
      setTotalPages(Math.ceil(rows.length / CHUNK_SIZE));
    }
  }, [mode, keys, keyIdsStr]);


  useEffect(() => {
    const sorted = [...rows].sort((a, b) =>
      sortByDate === "asc"
        ? a.titleId - b.titleId
        : b.titleId - a.titleId
    );
    setSortedRows(sorted);
  }, [sortByDate, rows]);



  const handleChangePage = (_: unknown, value: number) => {
    dispatch(changeSearchPage({ searchPage: value }));
  };


  const handleSearch = (searchStr: string) => {
    navigate(`/search?q=${encodeURIComponent(searchStr)}`);
  }

  if (!loaded) {
    return <div>Loading...</div>;
  }
  return (
    <Box sx={{
      p: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%"
    }}>
      <TitleSearchBar searchStr={search} onSearch={handleSearch} />

      <Paper
        elevation={2}
        sx={{
          p: 1,
          mt: 1,
          display: "flex",
          flexDirection: "column",
          height: "50vh",
          flexGrow: 1
        }}
      >
        {/* header */}
        <Box
          sx={{
            paddingBottom: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            alignItems: isMobile ? "stretch" : "center",
          }}
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
        </Box>

        {/* body */}
        <Box sx={{ overflowY: "auto", minHeight: "50vh" }}>
          <Box
            sx={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            {sortedTitles.map((t) => (
              <Box key={t.titleId}>
                <TitleCard t={t} isMobile={isMobile} words={words} />
              </Box>
            ))}
          </Box>
        </Box>

      </Paper>
    </Box>
  );
}


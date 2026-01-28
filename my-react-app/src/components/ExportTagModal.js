import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  useMediaQuery,
  Grid,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { MyModal } from "../components/dialog/MyModal";
import { DebouncedNumInput } from "../components/DebouncedNumInput";
import { collection, query, orderBy, limit, startAfter, getDocs, where, getCountFromServer } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { LoadMoreButton } from "../components/LoadMoreButton";
import CloseIcon from "@mui/icons-material/Close";
import { selectGdocToken, setGdocToken } from "../features/auth/authSlice";
import TitleCard, { TitleCardCommon, TitleEditor, titleToString } from "./TitleCard";
import { fetchTitleNextPage, updateTitle2 } from "../services/search/keyApi";
import { editTitle, selectMode, selectTags } from "../features/search/searchSlice";

/**
 * Fetch one page of records
 */
async function fetchNextPage({
  collectionName,
  pageSize = 100,
  lastDoc = null,
  tag = null,
}) {

  try {
    var {result:records} = await fetchTitleNextPage(collectionName, pageSize, lastDoc, tag);
    const nextCursor = 
      records.length > 0
        ? records[records.length - 1]
        : null;

    var result = {
      records,
      nextCursor,
      hasMore: records.length === pageSize,
    };
    return { result };
  } catch (err) {
    const error = {
      message: err?.message || "Unknown error",
      code: err?.code || "unknown",
      raw: err,
    };
    return { error };
  }

}

// GOOGLE DOC
function getGoogleDocId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}
function buildAppendRequests(titles, endIndex) {
  const requests = [];
  let index = endIndex;

  titles.forEach(({ title = "", path = "", titleId = 0, paragraphs = [] }) => {

    // ---- TITLE TEXT ----
    const titleText = `title: ${title}\n`;
    const titleStart = index;
    const titleEnd = index + titleText.length;

    // ---- PARAGRAPHS (optimized) ----
    const mergedParagraphs = paragraphs
      .map(p => p.trim())
      .filter(Boolean)
      .join("\n\n");

    // ---- TEXT ----
    var text = `${titleText}path: ${path}\nid :${titleId}\n${mergedParagraphs}\n\n`;

    requests.push({
      insertText: {
        location: { index },
        text,
      },
    });

    // Apply HEADING_4
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: titleStart,
          endIndex: titleEnd,
        },
        paragraphStyle: {
          namedStyleType: "HEADING_4",
        },
        fields: "namedStyleType",
      },
    });

    index += text.length;
  });

  return requests;
}
async function getDocEndIndex(docId, token) {
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const doc = await res.json();
  return doc.body.content.at(-1).endIndex - 1;
}
async function appendTitlesToDoc(docId, titles, token) {
  const endIndex = await getDocEndIndex(docId, token);

  const requests = buildAppendRequests(titles, endIndex);

  await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    }
  );
}

export const ExportTagModal = ({ tag, open, onClose, setAlertObj }) => {
    
  const isMobile = useMediaQuery("(max-width:600px)");

  const dispatch = useAppDispatch();
  const [url, setUrl] = useState("https://docs.google.com/document/d/1m7JeM35t1U91odtUpEF6EajIg_sRqJLE_fqKDKLRNZ0/edit?tab=t.0");
  const token = useSelector(selectGdocToken);

  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);
  const [batchSize, setBatchSize] = useState(100);
  const mode = useSelector(selectMode);

  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- get total tag ---
  useEffect(() => {
    async function getTotalCountByTag(collectionName, tag) {
      const q = query(
        collection(db, collectionName),
        where("tags", "array-contains", tag)
      );

      const snap = await getCountFromServer(q);
      setTotal(snap.data().count);
      setAlertObj({
        open: true,
        type: "info",
        message: `Total ${snap.data().count} titles with tag "${tag}".`,
      });
    }
    getTotalCountByTag("titles", tag.id);
   }, [setAlertObj, tag.id]);

  async function loadMore(saveToDoc = false) {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { result: res, error } = await fetchNextPage({
        collectionName: "titles",
        pageSize: batchSize,
        lastDoc: cursor,
        tag: tag.id,
      });

      if (res) {
        setAlertObj({
          open: true,
          type: "info",
          message: `Fetched ${res.records.length} titles.`,
        });
        if (saveToDoc && (res.records.length > 0) && token) {
          try {
            await appendTitlesToDoc(getGoogleDocId(url), res.records, token);
            setAlertObj({
              open: true,
              type: "info",
              message: `Saved ${res.records.length} titles.`,
            });
          } catch (err) {
            console.error("Error appending to Google Doc:", err);
            setAlertObj({
              open: true,
              type: "error",
              message: `Error saving ${res.records.length} titles.`,
            });
            setItems(prev => [...prev, ...res.records]);
          }
        }
        else {
          setItems(prev => [...prev, ...res.records]);
        }
        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
        setFetched(prev => prev + res.records.length);
      }
      else {
        console.log(error)
      }

    } finally {
      setLoading(false);
    }
  }

  const login = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/documents",
      callback: (resp) => {
        dispatch(setGdocToken({ gdocToken: resp.access_token }));
      },
    });

    tokenClient.requestAccessToken();
  };
  const appendToDoc = async () => {
    try {
      await appendTitlesToDoc(getGoogleDocId(url), items, token);
      setAlertObj({
        open: true,
        type: "info",
        message: `Saved ${items.length} titles to Google Doc.`,
      });
      setItems([]);
    } catch (err) {
      console.error("Error appending to Google Doc:", err);
      setAlertObj({
        open: true,
        type: "error",
        message: `Error saving ${items.length} titles.`,
      });
    }
  }

  // title view & edit
  async function handleSave(idx, changes) {
    var t = items[idx];
    if (Object.keys(changes).length) {
      var { result, error } = await updateTitle2(t, changes, mode);
      if (result) {
        // update store
        dispatch(editTitle({ id: t.titleId, changes, mode }));

        // update local data
        var newList = [...items];
        newList[idx] = { ...t, ...changes };
        setItems(newList);
      } else {
        console.error("Update failed:", error);
      }
    }
  }

  return (
    <MyModal
      open={open}
      onClose={onClose}
    >
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        spacing={1}
      >
        {/* title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            justifyItems: "center",
          }}
        >
          <Typography variant="h6">{tag.tag}</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* url, page size */}
        <TextField
          label="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        ></TextField>
        <DebouncedNumInput
          label={"pageSize"}
          id={batchSize}
          onChangeId={setBatchSize}
        ></DebouncedNumInput>
        <Box>
          {`Fetched: ${fetched} / ${total}`}
        </Box>

        {/* actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Button
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={!hasMore}
              onClick={()=>loadMore(false)}
            >
              {fetched === 0 ? "Fetch" : "More"}
            </Button>
          </Box>
          <>
            {(!token) && (
              <Button
                variant="contained"
                onClick={login}
              >Login with Google</Button>
            )}
            {(token && items.length > 0) && <Button
              onClick={appendToDoc}
            >
              Write to Google Doc
            </Button>}
            {(token && hasMore && (items.length === 0)) && <LoadMoreButton
              variant="contained"
              loading={loading}
              disabled={!hasMore}
              onClick={() => loadMore(true)}
            >{"Fetch & Write to Google Doc"}</LoadMoreButton>
            }
          </>
        </Box>

        {/* detail */}
        <Box
          sx={{ overflowY: "auto", maxHeight: "50vh", minHeight: "20vh" }}
        >
          <Stack
            container
            spacing={1}
          >
            {(items || []).map((t, idx) => (
                <TitleCardCommon
                 key={t.id} 
                 t={t} 
                 isMobile={isMobile} 
                 words={[]}
                 handleSave={({changes})=>handleSave(idx, changes)}
                 ></TitleCardCommon>
            ))}
          </Stack>
        </Box>
      </Stack>

    </MyModal>
  )
}

    

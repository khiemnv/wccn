import { use, useEffect, useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  Checkbox,
  Stack,
} from "@mui/material";
import { Edit, Save, Add } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  addTag,
  editTag,
  selectGdocToken,
  selectTags,
  setGdocToken,
} from "../features/search/searchSlice";
import {
  createTag,
  updateTag,
} from "../services/search/keyApi";
import { useAppDispatch } from "../app/hooks";
import CancelIcon from '@mui/icons-material/Cancel';
import { MyModal } from "../components/dialog/MyModal";
import { DebouncedNumInput } from "../components/DebouncedNumInput";
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, where, getCountFromServer } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { createNextState } from "@reduxjs/toolkit";
import { LoadMoreButton } from "../components/LoadMoreButton";
import CloseIcon from "@mui/icons-material/Close";

export default function TagPage() {
  const dispatch = useAppDispatch();
  const rawTags = useSelector(selectTags);
  //   console.log("Tags:", tags);
  const [newTag, setNewTag] = useState({});
  const [editing, setEditing] = useState({});

  // export
  const [exportTag, setExportTag] = useState();

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

  const [sortedTags, setSortedTags] = useState([]);
  useEffect(() => {
    if (rawTags == null) return;

    const sorted = [...rawTags];
    sorted.sort((a, b) => a.tag.localeCompare(b.tag))
    setSortedTags(sorted);
  }, [rawTags]);
  // --- Load tags on mount ---
  // useEffect(() => {
  //   async function loadTags() {
  //     try {
  //       const { result, error } = await getAllTags();
  //       if (result) {
  //         dispatch(setTags({ tags: result }));
  //       } else {
  //         console.error("Error loading tags from API:", error);
  //       }
  //     } catch (err) {
  //       console.error("Error loading tags:", err);
  //     }
  //   }
  //   if (!tags) {
  //     loadTags();
  //   }
  // }, [tags, dispatch]);

  const isMobile = useMediaQuery("(max-width:600px)");

  // --- Handlers ---
  const handleAdd = async () => {
    const tag = newTag.tag.trim();
    if (rawTags.find((t) => t.tag.trim().toLowerCase() === tag.toLowerCase())) {
      setAlertObj({
        open: true,
        type: "error",
        message: "Duplicated tag: " + newTag.tag,
      });
      return; // avoid duplicates
    }
    const { result } = await createTag({ tag: tag });
    if (result) {
      dispatch(addTag({ tag: result }));
      setNewTag({});
    }
  };

  const toggleTag = async (id, disabled) => {
    const { result } = await updateTag(id, { disabled });
    if (result) {
      dispatch(editTag({ id, changes: { disabled } }));
    }
  };

  const handleSave = async () => {
    const tag = editing.tag.trim();
    if (!tag) return;

    if (rawTags.find((t) => t.tag.trim().toLowerCase() === tag.toLowerCase())) {
      setAlertObj({
        open: true,
        type: "error",
        message: "Duplicated tag: " + editing.tag,
      });
      return; // avoid duplicates
    }

    const changes = { tag: tag };
    const { result } = await updateTag(editing.id, changes);
    if (result) {
      dispatch(editTag({ id: editing.id, changes: changes }));
      setEditing({});
    }
  };
  const handleCancel = () => {
    setEditing({});
  }

  if (!rawTags) {
    return <div>Loading tags...</div>;
  }

  const handleExport = (tagObj) => {
    setExportTag(tagObj);
  }

  // console.log("Sorted tags:", sorted);
  return (
    <Box sx={{
      p: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%"
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Tag Manager
      </Typography>

      {/* Add Tag */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1">
          Add Tag
        </Typography>
        <Box sx={{ display: "flex", m: 1, gap: 1 }}>
          <TextField
            fullWidth
            label="New tag"
            value={newTag.tag || ""}
            onChange={(e) => setNewTag({ tag: e.target.value })}
          />
          <Button
            variant="contained"
            disabled={!newTag.tag || !newTag.tag.trim()}
            onClick={handleAdd}
          >
            <Add />
          </Button>
        </Box>
      </Box>

      {/* Tag List */}
      <Box sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        minHeight: "50vh"
      }}>
        <Typography variant="subtitle1">
          Tags
        </Typography>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: "50vh",
          overflowY: "auto",
          p: 1
        }}>
          {sortedTags
            .map((tagObj, index) => (
              <Box
                key={index}
                sx={{ m: 0 }}
              >
                {editing.id === tagObj.id ? (
                  <Card sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <TextField
                      fullWidth
                      value={editing.tag}
                      onChange={(e) =>
                        setEditing({ ...editing, tag: e.target.value })
                      }
                      size="small"
                    />
                    <IconButton color="primary" onClick={handleSave}>
                      <Save />
                    </IconButton>
                    <IconButton color="error" onClick={handleCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Card>
                ) : (
                  <Card sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <Typography>{tagObj.tag}</Typography>
                    <Box>
                      <IconButton onClick={() => setEditing(tagObj)}>
                        <Edit />
                      </IconButton>
                      {/* <IconButton
                      color="error"
                      onClick={() => handleDel(tagObj.id)}
                    >
                      <Delete />
                    </IconButton> */}
                      <Checkbox
                        checked={!tagObj.disabled}
                        onChange={() => toggleTag(tagObj.id, !tagObj.disabled)}
                      >
                      </Checkbox>
                      <Button
                        variant="outlined"
                        onClick={() => handleExport(tagObj)}
                      >Export</Button>
                    </Box>
                  </Card>
                )}
              </Box>
            ))}
        </Box>
      </Box>

      {/* Alert */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={alertObj.open}
        autoHideDuration={5000}
        onClose={() => setAlertObj({ open: false })}
      >
        <Alert
          onClose={() => setAlertObj({ open: false })}
          severity={alertObj.type} // "error" | "warning" | "info" | "success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertObj.message}
        </Alert>
      </Snackbar>

      {/* export tag modal */}
      {exportTag && <ExportTagModal
        tag={exportTag}
        open={exportTag}
        onClose={() => setExportTag()}
        setAlertObj={setAlertObj}
      />}
    </Box>
  );
}

/**
 * Fetch one page of records
 */
export async function fetchNextPage({
  collectionName,
  pageSize = 100,
  lastDoc = null,
  tag = null,
}) {

  try {
    const q = lastDoc
      ? query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      )
      : query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        limit(pageSize)
      );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    const nextCursor =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    var result = {
      records,
      nextCursor,
      hasMore: snapshot.size === pageSize,
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
const CLIENT_ID = '512994061575-sc7dlfmqlhvq6900eo1vs51pdnv6lsvv.apps.googleusercontent.com';
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

const ExportTagModal = ({ tag, open, onClose, setAlertObj }) => {
  const dispatch = useAppDispatch();
  const [url, setUrl] = useState("https://docs.google.com/document/d/1m7JeM35t1U91odtUpEF6EajIg_sRqJLE_fqKDKLRNZ0/edit?tab=t.0");
  const token = useSelector(selectGdocToken);

  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);
  const [batchSize, setBatchSize] = useState(100);

  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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
      client_id: CLIENT_ID,
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
  return (
    <MyModal
      open={open}
      onClose={onClose}
    >
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column"
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
      </Stack>

    </MyModal>
  )
}

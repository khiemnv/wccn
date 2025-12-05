import { useState, useEffect, memo, use, useCallback } from "react";
import {
  Alert,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  addTag,
  editTag,
  editTitle,
  selectMode,
  selectTags,
  setTags,
} from "../features/search/searchSlice";
import {
  getAllTags,
  getTitleLog2,
  updateTitle2,
} from "../services/search/keyApi";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Collapse,
  CardHeader,
  TextField,
  IconButton,
  MenuItem,
  styled,
  Menu,
  Modal,
  Autocomplete,
} from "@mui/material";
import HighlightWords from "./HighlightWords";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import CloseIcon from "@mui/icons-material/Close";
import MergeIcon from '@mui/icons-material/Merge';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import FunctionsIcon from '@mui/icons-material/Functions'; // dùng cho regex
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import { selectRoleObj } from "../features/auth/authSlice";
import { diff_match_patch } from "diff-match-patch";
import { rApplyPath } from "../utils/fbUtil";
import { AlertDialog } from "./dialog/AlertDialog";
import { DONE, ERROR } from "../constant/strings";
import { set } from "firebase/database";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

function EditMenu({ onEdit, onDel, onCopy }) {
  const mode = useSelector(selectMode);
  const roleObj = useSelector(selectRoleObj);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const canWrite =
    mode === "QA" ? roleObj.titles === "write" : roleObj.bbh_titles === "write";
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="demo-customized-menu"
        slotProps={{
          list: {
            "aria-labelledby": "demo-customized-button",
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onCopy();
          }}
          disableRipple
        >
          <ContentCopyIcon />
          Copy
        </MenuItem>
        {canWrite && (
          <MenuItem
            onClick={() => {
              handleClose();
              onEdit();
            }}
            disableRipple
          >
            <EditIcon />
            Sửa
          </MenuItem>
        )}
        {/* {canWrite && (
          <MenuItem
            onClick={() => {
              handleClose();
              onDel();
            }}
            disableRipple
          >
            <DeleteIcon />
            Xóa
          </MenuItem>
        )} */}
      </Menu>
    </div>
  );
}

function EditTitleModal({ open, onClose, data, onSubmit }) {
  const isMobile = useMediaQuery("(max-width:600px)");
  // const [editingTitle, setEditingTitle] = useState(data);
  const handleSave = ({ changes }) => {
    onSubmit({ changes });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 600,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          maxHeight: isMobile ? "80vh" : "70vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <TitleEditor
          isMobile={isMobile}
          data={data}
          onClose={onClose}
          onSave={handleSave}
        />
      </Box>
    </Modal>
  );
}

export function TitleEditor({ isMobile, data, onSave, onClose }) {
  // console.log("TitleEditor data:", data);
  const dispatch = useDispatch();

  // log
  const [logs, setLogs] = useState();
  const [showLogModal, setShowLog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  // title
  const [editing, setEditing] = useState(data);
  const [path, setPath] = [
    editing.path,
    (path) => setEditing({ ...editing, path }),
  ];
  const [title, setTitle] = [
    editing.title,
    (title) => setEditing({ ...editing, title }),
  ];
  const [paragraphs, setParagraphs] = [
    editing.paragraphs,
    (paragraphs) => setEditing({ ...editing, paragraphs }),
  ];

  // Selected tags for this title (editable by the user)
  const setSelectedTags = useCallback((tags) =>
    setEditing((prev) => ({ ...prev, tags })), []
  );

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

  // replace
  const [dict, setDict] = useState([
    ["\\s+([.,:;?!])\\s*", "$1 ", true],
    ["ĐT", "đạo tràng"],
    ["CLB", "câu lạc bộ"],
    ["PT", "Phật tử"],
    ["BQT", "Bát quan trai"],
  ].map(pair => ({ find: pair[0], replace: pair[1], isReg: pair[2] ? true : false, selected: true })));
  const [openDict, setOpenDict] = useState(false);

  // --- Effects ------------------------------------------------------------
  // Sync khi data (props) thay đổi từ bên ngoài
  useEffect(() => {
    setEditing(data);
  }, [data]);

  // --- Handlers -----------------------------------------------------------
  const handleParagraphChange = useCallback((index, value) => {
    setEditing(prev => {
      const updated = [...prev.paragraphs];
      updated[index] = value;
      return { ...prev, paragraphs: updated };
    })
  }, []);

  const removeParagraph = useCallback((index) =>
    setEditing(prev => {
      const updated = prev.paragraphs.filter((_, i) => i !== index);
      return { ...prev, paragraphs: updated };
    }),
    []);

  const insertParagraph = useCallback((idx) => {
    setEditing(prev => {
      const updated = [...prev.paragraphs];
      updated.splice(idx + 1, 0, "");
      return { ...prev, paragraphs: updated };
    })
  }, []);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) setDragOverIndex(null);
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const updated = [...paragraphs];
      const [draggedParagraph] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedParagraph);
      setParagraphs(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    // If a drag ended while over an item but drop wasn't fired,
    // ensure we still reorder based on the current dragOverIndex.
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const updated = [...paragraphs];
      const [draggedParagraph] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, draggedParagraph);
      setParagraphs(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveParagraph = useCallback((fromIndex, toIndex) => {
    setEditing(prev => {
      const paragraphs = prev.paragraphs;
      if (fromIndex < 0 || fromIndex >= paragraphs.length) return prev;
      if (toIndex < 0 || toIndex >= paragraphs.length) return prev;
      const updated = [...paragraphs];
      const [movedParagraph] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedParagraph);
      return { ...prev, paragraphs: updated };
    });
  }, []);

  const combineParagraph = useCallback((index) => {
    setEditing(prev => {
      const paragraphs = prev.paragraphs;
      if (index < 0 || index >= paragraphs.length - 1) return prev;
      const combined = paragraphs[index] + "\n" + paragraphs[index + 1];
      const updated = [
        ...paragraphs.slice(0, index),
        combined,
        ...paragraphs.slice(index + 2),
      ];
      return { ...prev, paragraphs: updated };
    });
  }, []);

  console.log("edit title modal");

  function isSameArray(a, b) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

  var changes = {};
  var t = data;
  var edited = { ...editing};
  ["title", "path"].forEach((field) => {
    if (edited[field] !== t[field]) {
      changes[field] = edited[field];
    }
  });
  if (!isSameArray(edited.paragraphs, t.paragraphs)) {
    changes.paragraphs = edited.paragraphs;
  }
  if (!isSameArray(edited.tags || [], t.tags || [])) {
    changes.tags = edited.tags;
  }

  // log
  function handleCloseLogModal() {
    setShowLog(false);
  }

  const handleLog = async () => {
    console.log("handle log");
    if (true) {
      var { result } = await getTitleLog2(data.id);
      // console.log("log: ", result)
      if (result) {
        result.sort((a, b) => a.timestamp - b.timestamp);
        setLogs(result);
        if (!result.length) {
          setAlertObj({ message: "No logs available" });
        } else {
          setShowLog(true);
        }
      }
    }
  };

  const handleReplace = (pairs) => {
    const replacedLines = paragraphs.map(line => {
      let result = line;
      pairs.forEach(({ find, replace, isReg }) => {
        if (isReg) {
          const regex = new RegExp(find, "gu");
          result = result.replace(regex, replace);
        } else {
          result = replaceViWd(result, find, replace);
        }
      });
      return result;
    })
    setParagraphs(replacedLines);
    setOpenDict(false);
  }

  const handleCopy = async () => {
    try {
      var textToCopy = titleToString(editing);
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handlePaste = async () => {
    try {
      var clipboardText = await navigator.clipboard.readText();
      var lines = clipboardText.split(/\r?\n/);
      lines = lines.map((line) => line.trim()); //.filter((line) => line !== "");
      var newId = "";
      var state = "init";
      var changes = { paragraphs: [] };
      var curP = [];
      for (var i in lines) {
        var line = lines[i];
        switch (state) {
          case "init":
          case "id":
          case "title":
          case "path":
            if (line.startsWith("path: ")) {
              changes.path = line.slice(6).trim();
              state = "path";
            } else if (line.startsWith("id: ")) {
              newId = parseInt(line.slice(4).trim());
              state = "id";
            } else if (line.startsWith("title: ")) {
              changes.title = line.slice(7).trim();
              state = "title";
            } else if (line.startsWith("tags: ")) {
              changes.tags = line
                .slice(6)
                .split("#")
                .map((t) => t.trim())
                .filter((t) => t !== "");
              state = "tags";
            }
            break;
          case "tags":
            if (line === "" & curP.length > 0) {
              changes.paragraphs.push(curP.join("\n"));
              curP = [];
            } else {
              curP.push(line);
            }
            break;
          default:
            break;
        }
      }

      // add last paragraph
      if (curP.length) {
        changes.paragraphs.push(curP.join("\n"));
      }

      if (newId !== editing.titleId) {
        setAlertObj({ message: "Pasting with different ID is not supported." });
        return;
      }
      setEditing({ ...editing, ...changes });
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      return;
    }
  };

  const handlePreview = () => {
    setOpenPreview(true);
  };

  // console.log("editing", editing.paragraphs);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: "50vh",
        m: isMobile ? 1 : 2,
      }}
    >
      {/* header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexDirection: "row",
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"}>
          {`Edit Title: ${data.titleId}`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton aria-label="replace" onClick={() => setOpenDict(true)}>
            <FindReplaceIcon />
          </IconButton>
          <IconButton aria-label="copy" onClick={handleCopy}>
            <ContentCopyIcon />
          </IconButton>
          <IconButton aria-label="paste" onClick={handlePaste}>
            <ContentPasteIcon />
          </IconButton>
          <IconButton aria-label="log" onClick={handleLog}>
            <InfoOutlineIcon />
          </IconButton>
        </Box>
      </Box>

      {/* body */}
      <Box sx={{
        overflowY: "auto",
        mt: isMobile ? 1 : 2,
        mb: isMobile ? 1 : 2,
        flexGrow: 1
      }}>
        <Box sx={{ m: isMobile ? 1 : 2 }}>
          {/* path */}
          <TextField
            label="Path"
            multiline
            minRows={1}
            maxRows={3}
            fullWidth
            value={path}
            onChange={(e) => setPath(e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{ mb: isMobile ? 1 : 2 }}
          />

          {/* Title */}
          <TextField
            label="Title"
            multiline
            minRows={1}
            maxRows={3}
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{ mb: isMobile ? 1 : 2 }}
          />

          {/* Tags */}
          <TagEditor
            isMobile={isMobile}
            selectedTags={editing.tags}
            setSelectedTags={setSelectedTags}
          />
        </Box>

        {/* Paragraphs */}
        <Typography variant={isMobile ? "subtitle1" : "h6"} mb={isMobile ? 1 : 2}>
          Paragraphs (drag to reorder)
        </Typography>

        {paragraphs.map((p, idx) => {
          const isDragged = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx && !isDragged;
          return (
            <Box
              key={idx}
              sx={{
                position: "relative",
                // mb: isMobile ? 1 : 2,
                opacity: isDragged ? 0.5 : 1,
                transition: "opacity 0.2s, background-color 0.15s",
                backgroundColor: isDragOver
                  ? "rgba(25,118,210,0.08)"
                  : isDragged
                    ? "action.hover"
                    : "transparent",
                borderRadius: 1,
                m: isMobile ? 1 : 2,
              }}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnter={() => setDragOverIndex(idx)}
              onDragLeave={() => handleDragLeave(idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
            >
              <ParagraphEditor
                p={p}
                handleParagraphChange={handleParagraphChange}
                idx={idx}
                isMobile={isMobile}
                insertParagraph={insertParagraph}
                removeParagraph={removeParagraph}
                moveParagraph={moveParagraph}
                combineParagraph={combineParagraph}
              />
            </Box>
          );
        })}
      </Box>


      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          // flexDirection: isMobile ? "column" : "row",
          flexDirection: "row",
        }}
      >
        <Button
          onClick={() => handlePreview()}>Preview</Button>
        <Box>
          <Button
            variant="text"
            onClick={onClose}
          // fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => onSave({ changes })}
            // fullWidth={isMobile}
            disabled={Object.keys(changes).length === 0}
          >
            Save
          </Button>
        </Box>
      </Box>

      {logs && logs.length ? (
        <TitleLogModal
          showLogModal={showLogModal}
          handleCloseLogModal={handleCloseLogModal}
          isMobile={isMobile}
          logs={logs}
          base={data}
          onRevert={(obj) => {
            setShowLog(false);
            setEditing(obj);
          }}
        />
      ) : (
        <></>
      )}

      {
        openPreview && <PreviewModal
          open={openPreview}
          onClose={() => {
            setOpenPreview(false);
          }}
          title={editing}
        />
      }

      {
        openDict && <ReplaceModal
          open={openDict}
          dict={dict}
          setDict={setDict}
          onClose={() => setOpenDict(false)}
          onReplace={handleReplace}
        >

        </ReplaceModal>
      }

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
    </Box>
  );
}

const TagEditor = memo(
function TagEditor({ isMobile, selectedTags, setSelectedTags }) {
  console.log("TagEditor");

  const dispatch = useDispatch();

  // All available tags (from API or from store) used to suggest options
  const allTags = useSelector(selectTags);

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

  // Load all tags from API (fallback to store selector if API fails)
  // console.log("allTags from store:", allTags);
  const tagLstFromStore = allTags ? allTags.map((t) => t.tag) : [];
  useEffect(() => {
    async function loadTags() {
      try {
        const { result, error } = await getAllTags();
        if (result) {
          // attempt to read friendly name fields, fallback to raw value
          dispatch(setTags({ tags: result }));
        } else {
          console.error("Error loading tags from API:", error);
        }
      } catch (err) {
        console.error("Error loading tags:", err);
      }
    }
    if (!allTags) {
      loadTags();
    }
  }, [allTags, dispatch]);

  // --- Subscribe -----------------------------------------------------------
  useEffect(() => {
    const now = Timestamp.now();
    const q = query(
      collection(db, "/tags_log"),
      where("timestamp", ">=", now)
    );

    console.log("[Subscribe] Start at:", now.toDate().toLocaleString());

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const { id: logId } = change.doc;
          const { json, action, itemId, timestamp } = change.doc.data();

          console.log(
            `TAG log: [${logId}] ${action} [${itemId}] at ${timestamp
              .toDate()
              .toLocaleString()}`
          );
          console.log("content: ", json);

          if (true) {
            apply();
            console.log("applied");
          } else {
            console.log("skipped");
          }

          function apply() {
            try {
              const obj = JSON.parse(json);
              switch (action) {
                case "create":
                  dispatch(addTag({ tag: obj }));
                  break;
                case "update":
                  dispatch(editTag({ id: itemId, changes: obj }));
                  break;
                default:
                  console.warn("Unknown action:", action);
              }

              setAlertObj({
                open: true,
                type: "info",
                message:
                  "Đã cập nhật thay đổi tags: " +
                  timestamp.toDate().toLocaleString(),
              });
            } catch (e) {
              console.error("[Realtime] JSON parse error:", e, json);
            }
          }
        });
      }
    );

    return () => {
      console.log("[Subscribe] Unsubscribed");
      unsubscribe();
    };
  }, [dispatch]);

  const availableTags = (tagLstFromStore || []).filter(
    (tag) => !selectedTags || !selectedTags.includes(tag)
  );

  return (
    <Box sx={{ mb: isMobile ? 1 : 2 }}>
      <Autocomplete
        multiple
        freeSolo
        options={availableTags}
        value={selectedTags || []}
        onChange={(event, newValue) => setSelectedTags(newValue || [])}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            size={isMobile ? "small" : "medium"}
          />
        )}
      />

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
    </Box>
  );
})

function renderParagraphs(t, words) {
  return t.paragraphs
    .map((p) =>
      p
        .trim()
        .replace("question", "Câu hỏi")
        .replace("answer", "CCN chỉ dạy")
        .replace(/Cô (Chủ nhiệm|CN)/i, "CCN")
    )
    .filter((p) => p !== "")
    .map((s, idx) => {
      const isSubtitle = s.match("^Câu hỏi|^CCN chỉ dạy");
      return (
        <Box key={idx}>
          {isSubtitle ? (
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}
              color="primary"
            >
              {s}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              • <HighlightWords text={s.replace(/^[-\s]+/, "")} words={words} />
            </Typography>
          )}
        </Box>
      );
    });
}

function PreviewModal({ open, onClose, title }) {
  console.log("PreviewModal");

  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 600,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          maxHeight: isMobile ? "80vh" : "70vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ pr: 4 }}>
          {title.title.replace(/Question|cau/, "Câu")}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {renderTags(title)}
        </Box>

        <Box sx={{ overflowY: "auto", mt: isMobile ? 1 : 2, mb: isMobile ? 1 : 2 }}>
          {renderParagraphs(title, [])}
        </Box>

        {/* Close bottom-right */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="contained"
            fullWidth={isMobile}
            onClick={onClose}>
            OK
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

// Deep comparison function
function dictsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].find !== b[i].find ||
      a[i].replace !== b[i].replace ||
      a[i].selected !== b[i].selected
    ) {
      return false;
    }
  }
  return true;
}

function ReplaceModal({ open, onReplace, onClose, dict, setDict }) {
  console.log("ReplaceModal");

  // Local state for editing
  const [localDict, setLocalDict] = useState(dict);

  // Menu state: one menu per pair (using index)
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const handleMenuOpen = (event, idx) => {
    setAnchorEl(event.currentTarget);
    setMenuIdx(idx);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIdx(null);
  };

  // Add a new empty pair
  const handleAdd = () => {
    setLocalDict([...localDict, { find: '', replace: '', selected: true }]);
  };

  // Remove a pair by index
  const handleRemove = (idx) => {
    setLocalDict(localDict.filter((_, i) => i !== idx));
  };

  // Edit a pair
  const handleEdit = (idx, key, value) => {
    const newDict = localDict.map((pair, i) =>
      i === idx ? { ...pair, [key]: value } : pair
    );
    setLocalDict(newDict);
  };

  // Select a pair (only one can be selected)
  const handleToggleSelect = (idx) => {
    const newDict = localDict.map((pair, i) =>
      i === idx ? { ...pair, selected: !pair.selected } : pair
    );
    setLocalDict(newDict);
  };

  // Save changes to parent
  const handleSave = () => {
    setDict(localDict);
    // onClose();
  };

  // Reset local state when modal opens
  useEffect(() => {
    if (open) setLocalDict(dict);
  }, [open, dict]);


  // Check for changes
  const isChanged = !dictsEqual(localDict, dict);

  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 600,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          maxHeight: isMobile ? "80vh" : "70vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Top right close button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" mb={2}>Edit Dictionary</Typography>
        
        {/* pair */}
        <Box
        sx={{
          display: "flex",
          height: "50vh",
          flexGrow: 1,
          overflowY: "auto",
          flexDirection: "column"
        }}
        >
          {localDict.map((pair, idx) => (
            <Paper
              key={idx}
              elevation={pair.selected ? 3 : 1}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                p: 1,
                // backgroundColor: pair.selected ? 'primary.light' : 'background.paper',
                cursor: 'pointer',
              }}
            // onClick={() => handleToggleSelect(idx)}
            >
              {/* <Tooltip title="Selected">
              <Checkbox
                checked={pair.selected}
                onChange={e => handleEdit(idx, "selected", e.target.checked)}
                size="small"
              />
            </Tooltip> */}
              <TextField
                label="Find"
                value={pair.find}
                size="small"
                onChange={e => handleEdit(idx, 'find', e.target.value)}
                sx={{
                  mr: 1,
                  width: { xs: 80, sm: 120, md: 140 }, // responsive width
                  flexShrink: 0
                }}
              />
              <TextField
                label="Replace"
                value={pair.replace}
                size="small"
                onChange={e => handleEdit(idx, 'replace', e.target.value)}
                sx={{
                  mr: 1,
                  minWidth: 80,
                  flexGrow: 1,         // grow ra
                  flexBasis: 0,        // chiếm phần còn lại
                }}
              />
              <IconButton
                size="small"
                onClick={e => handleMenuOpen(e, idx)}
                sx={{ flexShrink: 0 }}
              >
                <MoreVertIcon />
              </IconButton>
              {/* Menu cho từng dòng */}
              <Menu
                anchorEl={anchorEl}
                open={menuIdx === idx}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem
                  onClick={() => {
                    handleEdit(idx, "selected", !pair.selected);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={pair.selected}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                      size="small"
                      sx={{ p: 0, m: 0 }}
                    />
                  </ListItemIcon>
                  <ListItemText primary="Selected" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleEdit(idx, "isReg", !pair.isReg);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <FunctionsIcon color={pair.isReg ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Regex" />
                </MenuItem>
                <MenuItem
                  onClick={() => handleRemove(idx)}
                >
                  <ListItemIcon>
                    <DeleteIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Xóa" />
                </MenuItem>
              </Menu>
            </Paper>
          ))}   
        </Box>


        {/* add and save buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2, // spacing between buttons
            mt: 2,
          }}
        >
          <Button onClick={handleAdd} variant="outlined">Add</Button>
          <Button onClick={handleSave}
            variant="contained"
            disabled={!isChanged}
          >Save</Button>
        </Box>

        {localDict.some(pair => pair.selected) && (
          <Typography sx={{ mt: 2 }}>
            Replace:
            {localDict
              .filter(pair => pair.selected)
              .map(pair => ` "${pair.find}" -> "${pair.replace}"`)
              .join('; ')}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2, // spacing between buttons
            mt: 2,
          }}
        >
          <Button onClick={onClose} variant="outlined" >Cancel</Button>
          <Button onClick={() => onReplace(localDict.filter(pair => pair.selected))} variant="contained" >Replace</Button>
        </Box>

      </Box>
    </Modal>
  );
}

function renderTags(title) {
  return title.tags ? title.tags.map((tag, idx) => (
    <Chip
      sx={{ mr: 1 }}
      label={tag}
      key={idx}></Chip>
  )) : <></>;
}

function TitleLogModal({
  showLogModal,
  handleCloseLogModal,
  isMobile,
  logs,
  base,
  onRevert,
}) {
  console.log("title log modal");

  const [selected, setSelected] = useState(logs.length - 1);
  const [data, setData] = useState(base);

  const [options, setOptions] = useState([]);
  function sortLogs(logs) {
    function tsToStr(ts) {
      const date = ts.toDate();
      const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
      return formatted;
    }
    const sortedLogs = logs
      .map((log, idx) => ({ idx, seconds: log.timestamp.seconds, label: tsToStr(log.timestamp) }));
    sortedLogs.sort((a, b) => b.seconds - a.seconds);
    return sortedLogs;
  }

  useEffect(() => {
    setOptions(sortLogs(logs));
  }, [logs])
  function titleToStr(title) {
    return [
      title.path,
      title.id,
      (title.tags || []).join(", "),
      ...title.paragraphs,
    ].join("\n");
  }

  function handleUndo(idx) {
    setSelected(idx);
  }
  function calcDiff(idx, afterJson) {
    var version = [afterJson];
    try {
      for (var i = logs.length - 1; i >= idx; i--) {
        var patch = logs[i].patch;
        var { result } = rApplyPath(version[0], patch);
        // console.log(i, patch, beforeJson);
        if (result) {
          version.splice(0, 0, result);
        } else {
          break;
        }
      }
    } catch (ex) { }
    return version.slice(0, 2);
  }
  // restore prev version
  var baseJson = JSON.stringify(base);
  var [beforeJson, afterJson] = calcDiff(selected, baseJson);

  if (!beforeJson && !afterJson) {
    return <div>Error</div>;
  }

  // create diff
  var dmp = new diff_match_patch();
  var beforeStr = titleToStr(JSON.parse(beforeJson));
  var afterStr = titleToStr(JSON.parse(afterJson));
  var diff = dmp.diff_main(beforeStr, afterStr);

  // console.log(dmp.diff_prettyHtml(diff))
  var left = [];
  var right = [];
  diff.forEach(([op, data], idx) => {
    if (op === 0) {
      left.push(
        <span key={idx} style={{ whiteSpace: "pre-line", textWrap: "auto" }}>
          {data}
        </span>
      );
      right.push(
        <span key={idx} style={{ whiteSpace: "pre-line", textWrap: "auto" }}>
          {data}
        </span>
      );
    } else if (op === 1) {
      right.push(
        <ins key={idx} style={{ background: "#0ee60eff" }}>
          {data}
        </ins>
      );
    } else {
      left.push(
        <del key={idx} style={{ background: "#e4db8bff" }}>
          {data}
        </del>
      );
    }
  });
  // const [selected, setSelected] = useState(0);
  return (
    <Modal open={showLogModal} onClose={handleCloseLogModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 600,
          maxWidth: "90vw",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          maxHeight: isMobile ? "80vh" : "70vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* header */}
        <FormControl size="small">
          <InputLabel id="verison-select-label">Version</InputLabel>
          <Select
            labelId="verison-select-label"
            label="Version"
            value={selected}
            onChange={(e) => handleUndo(e.target.value)}
            renderValue={(option) => {
              const idx = option;
              const date = logs[idx].timestamp.toDate();
              const formatted = `${date.getDate()}/${date.getMonth() + 1
                }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
              return formatted;
            }}
          >
            {logs &&
              options.map(({ idx, label }) => {
                return (
                  <MenuItem
                    key={idx}
                    sx={{
                      display: "flex",
                      direction: "row",
                      alignItems: "center",
                    }}
                    value={idx}
                  // onClick={() => handleUndo(idx)}
                  >
                    <Radio
                      checked={idx === selected}
                    ></Radio>
                    <Typography>{label}</Typography>
                  </MenuItem>
                );
              })}
          </Select>

        </FormControl>
        {/* <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            overflow: "auto",
            maxHeight: "30vh",
            minHeight: "10vh"
          }}
        >
          {logs &&
            logs.map((log, idx) => {
              const date = log.timestamp.toDate();
              const formatted = `${date.getDate()}/${date.getMonth() + 1
                }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

              return (
                <Box
                  key={log.id}
                  sx={{
                    display: "flex",
                    direction: "row",
                    alignItems: "center",
                  }}
                >
                  <Radio
                    checked={idx === selected}
                    onClick={() => handleUndo(idx)}
                  ></Radio>
                  <Typography>{formatted}</Typography>
                </Box>
              );
            })}
        </div> */}

        {/* body */}
        <div style={{ width: "100%", display: "flex", flexDirection: "row", overflowY: "auto", margin: "8px 0 8px 0" }}>
          <Box sx={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            height: "fit-content",
            width: "50%",
          }}>

            <Box
              sx={{
                border: '1px solid',
                mr: 0.5,
                p: 0.5,
                height: 'fit-content',
                borderRadius: '0.5rem',
                whiteSpace: 'pre-line',
                minHeight: '50vh'
              }}
            >
              {left}
            </Box>
          </Box>
          <Box sx={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            height: "fit-content",
            width: "50%",
          }}>
            <Box
              sx={{
                border: '1px solid',
                mr: 0.5,
                p: 0.5,
                height: 'fit-content',
                borderRadius: "0.5rem",
                whiteSpace: 'pre-line',
                minHeight: '50vh'
              }}
            >
              {right}
            </Box>
          </Box>

        </div>
        {/* <div style={{ whiteSpace: "pre", textWrap: "auto", border: "1px, solid", padding: "0.5rem", margin: "1px" }}>
        {beforeStr}
      </div> */}

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            // flexDirection: isMobile ? "column" : "row",
            // mt: "0.5rem",
          }}
        >
          <Button
            variant="text"
            onClick={handleCloseLogModal}
          // fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => onRevert(JSON.parse(beforeJson))}
          // fullWidth={isMobile}
          // disabled={selected && (selected === (logs.length-1))}
          >
            Revert
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

const ParagraphEditor = memo(
   function ParagraphEditor({
  p,
  handleParagraphChange,
  idx,
  isMobile,
  insertParagraph,
  removeParagraph,
  moveParagraph,
  combineParagraph,
}) {
  console.log("ParagraphEditor", idx);
  const [isFocused, setIsFocused] = useState(false);
  // const [text, setText] = useState(p);

  // Holds all history values, starting with an empty string
  const [history, setHistory] = useState(['']);
  // Current position in history
  const [currentIndex, setCurrentIndex] = useState(0);

  const [saveConfirm, setSaveConfirm] = useState(false);

  useEffect(() => {
    setHistory([p]);
    setCurrentIndex(0);
  }, [p]);

  const onMoveUp = () => {
    moveParagraph(idx, idx - 1);
  };

  const onMoveDown = () => {
    moveParagraph(idx, idx + 1);
  };

  // Current text value
  const text = history[currentIndex];

  const handleChange = (e) => {
    const newValue = e.target.value;

    // Remove future history if we type after undo
    const newHistory = history.slice(0, currentIndex + 1);

    setHistory([...newHistory, newValue]);
    setCurrentIndex(newHistory.length); // point to the new value
  };

  // Undo (go back in history)
  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Redo (go forward in history)
  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const editMode = history.length > 1;

  const handleBlur = () => {
    // if (editMode) {
    //   setSaveConfirm(true);
    // }
  }
  const handleSave = () => {
    handleParagraphChange(idx, text);
  }
  return (
    <Box prosition="relative" sx={{ mb: isMobile ? 1 : 2 }}>
      <TextField
        sx={{
          // mt: 1,
          '& .MuiInputBase-input': {
            paddingTop: 2,         // padding inside textarea
            paddingBottom: 2,         // padding inside textarea
          }
        }}
        multiline
        minRows={1}
        maxRows={12}
        // onInput={(e) => {
        //   const ta = e.target;
        //   ta.style.height = "auto";
        //   ta.style.height = `${ta.scrollHeight}px`;
        // }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          handleBlur();
          // handleParagraphChange(idx, text);
        }}
        fullWidth
        value={text}
        onChange={(e) => {
          handleChange(e);
          // handleAutoResize(e); // auto resize khi nhập
        }}
        label={`Paragraph ${idx + 1}`}
        size={isMobile ? "small" : "medium"}
      />
      {editMode && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            // backgroundColor: "#0ee3e380"
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            <IconButton
              disabled={history.length === 1}
              size={isMobile ? "small" : "medium"}
              aria-label="save"
              onClick={handleSave}
              color="primary"
            >
              <SaveIcon fontSize="small" />
            </IconButton>

            <IconButton
              disabled={currentIndex === 0}
              size={isMobile ? "small" : "medium"}
              aria-label="undo"
              onClick={handleUndo}
              color="primary"
            >
              <UndoIcon fontSize="small" />
            </IconButton>

            <IconButton
              disabled={currentIndex === (history.length - 1)}
              size={isMobile ? "small" : "medium"}
              aria-label="redo"
              onClick={handleRedo}
              color="primary"
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      {!editMode && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            // backgroundColor: "#0ee3e380"
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            <IconButton
              size={isMobile ? "small" : "medium"}
              aria-label="drag handle"
            >
              <DragIndicatorIcon sx={{ transform: "rotate(90deg)" }} />
            </IconButton>

            <IconButton
              size={isMobile ? "small" : "medium"}
              aria-label="move up"
              onClick={onMoveUp}
              color="primary"
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>

            <IconButton
              size={isMobile ? "small" : "medium"}
              aria-label="move down"
              onClick={onMoveDown}
              color="primary"
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      {!editMode && (
        <Box sx={{ position: "absolute", bottom: 2, right: 2 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              onClick={() => combineParagraph(idx)}
              size={isMobile ? "small" : "medium"}
              title="Combine with paragraph after this"
            >
              <MergeIcon color="primary" />
            </IconButton>
            <IconButton
              onClick={() => insertParagraph(idx)}
              size={isMobile ? "small" : "medium"}
              title="Insert new paragraph after this"
            >
              <AddIcon color="primary" />
            </IconButton>
            <IconButton
              onClick={() => removeParagraph(idx)}
              size={isMobile ? "small" : "medium"}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        </Box>
      )}

      {saveConfirm && <Dialog
        open={saveConfirm}
        onClose={() => setSaveConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"UN-SAVED CONFIRM"}</DialogTitle>
        <DialogContent>{"Save editing?(YES/NO)"}</DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveConfirm(false)}>{"NO"}</Button>
          <Button
            onClick={() => {
              setSaveConfirm(false);
              handleSave();
            }}
            autoFocus
          >
            {"YES"}
          </Button>
        </DialogActions>
      </Dialog>}
    </Box>
  );
})
function isSameArray(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function titleToString(title) {
  return [
    `path: ${title.path}`,
    `id: ${title.titleId}`,
    `title: ${title.title}`,
    `tags: ${(title.tags || []).map((t) => `#${t}`).join(" ")}`,
    title.paragraphs.join("\n\n"),
  ].join("\n");
}

function TitleCard({ t, isMobile, words }) {
  console.log("TitleCard");
  const mode = useSelector(selectMode);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => setExpanded((prev) => !prev);
  const handleEdit = () => {
    setOpen(true);
  };
  const handleCopy = async () => {
    try {
      const text = titleToString(t);
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };
  const handleDel = () => { };
  const handleSave = async ({ changes, patch }) => {
    if (Object.keys(changes).length) {
      var { result, error } = await updateTitle2(t, changes, mode);
      console.log(result, error);
      if (result) {
        dispatch(editTitle({ id: t.titleId, changes, mode }));
      }
    }
  };
  const [open, setOpen] = useState(false);
  return !open ? (
    <Card
      variant="outlined"
      sx={{
        mb: isMobile ? 0 : 1,
        width: isMobile ? "100%" : "auto",
        boxSizing: "border-box",
      }}
    >
      <CardHeader
        title={t.path}
        subheader={`ID: ${t.titleId}`}
        action={
          <EditMenu onEdit={handleEdit} onCopy={handleCopy} onDel={handleDel} />
        }
      ></CardHeader>
      <CardContent>
        <Typography variant="h6">
          {t.title.replace(/Question|cau/, "Câu")}
        </Typography>
        {renderTags(t)}
      </CardContent>
      <CardActions>
        <Box sx={{ width: "100%", textAlign: "left" }}>
          <Button size="small" onClick={handleExpandClick}>
            {expanded ? "Ẩn chi tiết" : "Chi tiết"}
          </Button>
        </Box>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{renderParagraphs(t, words)}</CardContent>
        {expanded && (
          <Box sx={{ textAlign: "left", mt: 1, ml: 1 }}>
            <Button size="small" onClick={handleExpandClick}>
              Ẩn chi tiết
            </Button>
          </Box>
        )}
      </Collapse>
    </Card>
  ) : (
    <EditTitleModal
      open={open}
      onClose={() => setOpen(false)}
      data={t}
      onSubmit={handleSave}
    />
  );
}
export default TitleCard;


function replaceViWd(text, find, replace) {
  const VWORD = "A-Za-zÀ-Ỵà-ỵĂăÂâĐđÊêÔôƠơƯư";
  const regex = new RegExp(`(?<![${VWORD}])${find}(?![${VWORD}])`, "gu");
  return text.replace(regex, replace);
}

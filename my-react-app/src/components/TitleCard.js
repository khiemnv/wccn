import { useState, useEffect } from "react";
import { useMediaQuery } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  editTitle,
  selectMode,
  selectTags,
  setTags,
} from "../features/search/searchSlice";
import { getAllTags, updateTitle } from "../services/search/keyApi";
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { selectRoleObj } from "../features/auth/authSlice";

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
        {canWrite && (
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
        )}
      </Menu>
    </div>
  );
}

function EditTitleModal({ open, onClose, data, onSubmit }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const dispatch = useDispatch();
  const [path, setPath] = useState(data.path);
  const [title, setTitle] = useState(data.title);
  const [paragraphs, setParagraphs] = useState(data.paragraphs);
  // Selected tags for this title (editable by the user)
  const [selectedTags, setSelectedTags] = useState([]);
  // All available tags (from API or from store) used to suggest options
  const allTags = useSelector(selectTags);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // --- Effects ------------------------------------------------------------
  // Initialize selected tags from incoming `data.tags` whenever data changes
  useEffect(() => {
    setSelectedTags(Array.isArray(data.tags) ? data.tags : []);
  }, [data.tags]);

  // Load all tags from API (fallback to store selector if API fails)
  const tagLstFromStore = allTags? allTags.map(t=>t.tag) : [];
  useEffect(() => {
    let mounted = true;
    async function loadTags() {
      try {
        const { result } = await getAllTags();
        if (!mounted) return;
        if (result) {
          // attempt to read friendly name fields, fallback to raw value
          dispatch(setTags({tags:result}));
        }
      } catch (err) {
      }
    }
    if (!allTags) {
      loadTags();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const handleParagraphChange = (index, value) => {
    const updated = [...paragraphs];
    updated[index] = value;
    setParagraphs(updated);
  };

  const availableTags = (tagLstFromStore || []).filter(
    (tag) => !selectedTags.includes(tag)
  );
  const removeParagraph = (index) =>
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  const insertParagraph = (idx) => {
    const newParagraphs = [...paragraphs];
    newParagraphs.splice(idx + 1, 0, "");
    setParagraphs(newParagraphs);
  };

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

  const handleSave = () => {
    onSubmit({
      titleId: data.titleId,
      path,
      title,
      paragraphs,
      tags: selectedTags,
    });
    onClose();
  };

  console.log("edit title modal");

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
          maxHeight: isMobile ? "90vh" : "80vh",
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} mb={2}>
          {`Edit Title: ${data.titleId}`}
        </Typography>

        {/* path */}
        <TextField
          label="Path"
          fullWidth
          value={path}
          onChange={(e) => setPath(e.target.value)}
          size={isMobile ? "small" : "medium"}
          sx={{ mb: 2 }}
        />

        {/* Title */}
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size={isMobile ? "small" : "medium"}
          sx={{ mb: 2 }}
        />

        {/* Tags */}
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={selectedTags}
            onChange={(event, newValue) => setSelectedTags(newValue || [])}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                size={isMobile ? "small" : "medium"}
              />
            )}
          />
        </Box>


        {/* Paragraphs */}
        <Typography variant={isMobile ? "subtitle1" : "h6"} mb={1}>
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
                mb: 2,
                opacity: isDragged ? 0.5 : 1,
                transition: "opacity 0.2s, background-color 0.15s",
                backgroundColor: isDragOver ? "rgba(25,118,210,0.08)" : isDragged ? "action.hover" : "transparent",
                borderRadius: 1,
                p: 1,
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
              />
            </Box>
          );
        })}

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
          <Button
            variant="text"
            onClick={onClose}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth={isMobile}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

function ParagraphEditor({ p, handleParagraphChange, idx, isMobile, insertParagraph, removeParagraph }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box>
      <TextField
        multiline
        minRows={2}
        maxRows={12}
        onInput={(e) => {
          const ta = e.target;
          ta.style.height = "auto";
          ta.style.height = `${ta.scrollHeight}px`;
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        fullWidth
        value={p}
        onChange={(e) => handleParagraphChange(idx, e.target.value)}
        label={`Paragraph ${idx + 1}`}
        size={isMobile ? "small" : "medium"}
      />

      {!isFocused && (
        <Box sx={{ position: "absolute", top: 2, left: 2 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton>
              <DragIndicatorIcon color="primary" sx={{ transform: "rotate(90deg)" }} />
            </IconButton>
          </Box>
        </Box>
      )}
      {!isFocused && (
        <Box sx={{ position: "absolute", bottom: 2, right: 2 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
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
    </Box>
  );
}


function isSameArray(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
function TitleCard({ t, isMobile, words }) {
  const mode = useSelector(selectMode);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => setExpanded((prev) => !prev);
  const handleEdit = () => {
    setOpen(true);
  };
  const handleCopy = () => { };
  const handleDel = () => { };
  const handleSave = async (edited) => {
    var changes = {};
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
    if (Object.keys(changes).length) {
      var { result, error } = await updateTitle(t.id, changes, mode);
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
        <CardContent>
          {t.paragraphs
            .map((p) =>
              p
                .trim()
                .replace("question", "Câu hỏi")
                .replace("answer", "CCN chỉ dạy")
            )
            .filter((p) => p !== "")
            .map((s, idx) => {
              const isCauHoi = s.match("Câu hỏi|CCN chỉ dạy");
              return (
                <Box key={idx}>
                  {isCauHoi ? (
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}
                      color="primary"
                    >
                      {s}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      •{" "}
                      <HighlightWords
                        text={s.replace(/^[-\s]+/, "")}
                        words={words}
                      />
                    </Typography>
                  )}
                </Box>
              );
            })}
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
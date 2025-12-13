import { useState, useEffect, memo, useCallback, useRef, useMemo } from "react";
import {
  Alert,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  changeEditMode,
  editTitle,
  selectDict,
  selectEditmode,
  selectMode,
  selectTags,
  setDict,
} from "../features/search/searchSlice";
import {
  getTitleLog2,
  updateTitle2,
  updateTitleLog2,
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
import HighlightWords, { EditableHighlight } from "./HighlightWords";

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
import MergeIcon from "@mui/icons-material/Merge";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import FunctionsIcon from "@mui/icons-material/Functions"; // dùng cho regex
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";

import { selectRoleObj } from "../features/auth/authSlice";
import { diff_match_patch } from "diff-match-patch";
import {
  calcPath,
  decodeDiffText,
  rApplyPath,
  stableStringify,
} from "../utils/fbUtil";
import { DiffView } from "./DiffView";
import ChipDragSort from "./DraggableChip";
import { useAppDispatch } from "../app/hooks";
import debounce from "debounce";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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
    <MyModal open={open} onClose={onClose}>
      <DialogTitle>{`Edit Title: ${data.titleId}`}</DialogTitle>
      <TitleEditor
        isMobile={isMobile}
        data={data}
        onClose={onClose}
        onSave={handleSave}
      />
    </MyModal>
  );
}

function SortableItem({ id, children, isMobile, p }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        position: "relative",
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        // borderRadius: 1,
        // m: isMobile ? 1 : 2,
        backgroundColor: isDragging ? "action.hover" : "transparent",
        display:"flex",
        flexDirection:"row",
        alignItems: "center"
      }}
    >
      {children}
      {/* {isDragging && <DebouncedTextField
        multiline
        minRows={1}
        maxRows={12}
        fullWidth
        value={p}
      />} */}
    </Box>
  );
}
function OverlayItem({ paragraph }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        p: 1,
        width: "100%",
        boxShadow: 4,
        background: "white",
        opacity: 0.9,
      }}
    >
      {/* simple non-resizing clone */}
      <DebouncedTextField
        multiline
        minRows={1}
        maxRows={12}
        fullWidth
        value={paragraph}
      />
    </Box>
  );
}
export function TitleEditor({ name, isMobile, data, onSave, onClose }) {
  // console.log("TitleEditor data:", data);
  const dispatch = useDispatch();

  // log
  const [logs, setLogs] = useState();
  const [showLogModal, setShowLog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  const historyRef = useRef([data]);
  const indexRef = useRef(0);

  const [localData, setLocalData] = useState(data);
  const handleChange = useCallback((field, value) => {
    setLocalData((prev) => {
      const newData = { ...prev, [field]: value };
      updateHis(newData);
      return newData;
    });
  }, []);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const editMode = useSelector(selectEditmode);
  const editContent = editMode === "advanced"; // basic or advanced

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

  // replace
  const [openDict, setOpenDict] = useState(false);

  // --- Effects ------------------------------------------------------------
  // Sync khi data (props) thay đổi từ bên ngoài
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // --- Handlers -----------------------------------------------------------
  const handleTagsChange = useCallback((tags) => {
    setLocalData((prev) => {
      const newData = { ...prev, "tags": tags };
      updateHis(newData);
      return newData;
    });
  }, []);
  const handleParagraphChange = useCallback((index, value) => {
    setLocalData((prev) => {
      const paragraphs = [...prev.paragraphs];
      paragraphs[index] = value;
      const newData = { ...prev, paragraphs };
      updateHis(newData);
      return newData;
    });
  }, []);

  const removeParagraph = useCallback((index) => {
    setLocalData((prev) => {
      const paragraphs = prev.paragraphs.filter((_, i) => i !== index);
      const newData = { ...prev, paragraphs };
      updateHis(newData);
      return newData;
    });
  }, []);

  const insertParagraph = useCallback((idx) => {
    setLocalData((prev) => {
      const paragraphs = [...prev.paragraphs];
      paragraphs.splice(idx + 1, 0, "");
      const newData = { ...prev, paragraphs };
      updateHis(newData);
      return newData;
    });
  }, []);

  const moveParagraph = useCallback((fromIndex, toIndex) => {
    setLocalData((prev) => {
      const paragraphs = prev.paragraphs;
      if (fromIndex < 0 || fromIndex >= paragraphs.length) return prev;
      if (toIndex < 0 || toIndex >= paragraphs.length) return prev;
      const updated = [...paragraphs];
      const [movedParagraph] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedParagraph);
      const newData = { ...prev, paragraphs: updated };
      updateHis(newData);
      return newData;
    });
  }, []);

  const combineParagraph = useCallback((index) => {
    setLocalData((prev) => {
      const paragraphs = prev.paragraphs;
      if (index < 0 || index >= paragraphs.length - 1) return prev;
      const combined = paragraphs[index] + "\n" + paragraphs[index + 1];
      const newData = {
        ...prev,
        paragraphs: [
          ...paragraphs.slice(0, index),
          combined,
          ...paragraphs.slice(index + 2),
        ],
      };
      updateHis(newData);
      return newData;
    });
  }, []);

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) setDragOverIndex(null);
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const updated = [...localData.paragraphs];
      const [draggedParagraph] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedParagraph);
      handleChange("paragraphs", updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // const handleDragEnd = useCallback(() => {
  //   // If a drag ended while over an item but drop wasn't fired,
  //   // ensure we still reorder based on the current dragOverIndex.
  //   // if (
  //   //   draggedIndex !== null &&
  //   //   dragOverIndex !== null &&
  //   //   draggedIndex !== dragOverIndex
  //   // ) {
  //   //   const updated = [...paragraphs];
  //   //   const [draggedParagraph] = updated.splice(draggedIndex, 1);
  //   //   updated.splice(dragOverIndex, 0, draggedParagraph);
  //   //   setParagraphs(updated);
  //   // }
  //   setDraggedIndex(null);
  //   setDragOverIndex(null);
  // }, []);
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      const newList = arrayMove(localData.paragraphs, oldIndex, newIndex);
      handleChange("paragraphs", newList);
    }
  };

  console.log("TitleEditor");

  function updateHis(newData) {
    // If the user types after undo, truncate redo history
    if (indexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    }
    historyRef.current.push(newData);
    indexRef.current = historyRef.current.length - 1;
    console.log(historyRef.current.length);
  }

  function isSameArray(a, b) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

  var changes = {};
  ["title", "path"].forEach((field) => {
    if (localData[field] !== data[field]) {
      changes[field] = localData[field];
    }
  });
  if (!isSameArray(localData.paragraphs, data.paragraphs)) {
    changes.paragraphs = localData.paragraphs;
  }
  if (!isSameArray(localData.tags || [], data.tags || [])) {
    changes.tags = localData.tags;
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
        result.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
        setLogs(result);
        if (!result.length) {
          setAlertObj({
            open: true,
            type: "warning",
            message: "No logs available",
          });
        } else {
          setShowLog(true);
        }
      }
    }
  };

  const handleReplace = useCallback((pairs) => {
    setLocalData((prev) => {
      const paragraphs = prev.paragraphs.map((line) => {
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
      });
      const newData = { ...prev, paragraphs };
      historyRef.current.push(newData);
      indexRef.current = historyRef.current.length - 1;
      return newData;
    });
    setOpenDict(false);
  }, []);

  const handleCopy = async () => {
    try {
      var textToCopy = titleToString(localData);
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
            if ((line === "") & (curP.length > 0)) {
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

      if (newId !== localData.titleId) {
        setAlertObj({ message: "Pasting with different ID is not supported." });
        return;
      }

      const newData = { ...localData, ...changes };
      historyRef.current.push(newData);
      indexRef.current = historyRef.current.length - 1;
      setLocalData(newData);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      return;
    }
  };

  // Undo (go back in history)
  const handleUndo = () => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setLocalData(historyRef.current[indexRef.current]);
    }
  };

  // Redo (go forward in history)
  const handleRedo = () => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      setLocalData(historyRef.current[indexRef.current]);
    }
  };

  const handlePreview = () => {
    setOpenPreview(true);
  };

  // const showCtrl = true;

  // DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }, // long press iPhone
    })
  );
  const [activeId, setActiveId] = useState(null);
  const [editingP, setEditingP] = useState(null);
  const modalRef = useRef(null);
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
        <Typography variant={isMobile ? "h6" : "h5"}>{name}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            disabled={indexRef.current === 0}
            aria-label="undo"
            color="primary"
            onClick={handleUndo}
          >
            <UndoIcon fontSize="small" />
          </IconButton>

          <IconButton
            disabled={indexRef.current === historyRef.current.length - 1}
            aria-label="redo"
            color="primary"
            onClick={handleRedo}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
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
      <Box
        sx={{
          overflowY: "auto",
          mt: isMobile ? 1 : 2,
          mb: isMobile ? 1 : 2,
          flexGrow: 1,
        }}
      >
        <Box sx={{ m: isMobile ? 1 : 2 }}>
          {/* path */}
          <DebouncedTextField
            label="Path"
            multiline
            minRows={1}
            maxRows={3}
            fullWidth
            value={localData.path}
            onChange={(e) => handleChange("path", e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{ mb: isMobile ? 1 : 2 }}
          />

          {/* Title */}
          <DebouncedTextField
            label="Title"
            multiline
            minRows={1}
            maxRows={3}
            fullWidth
            value={localData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{ mb: isMobile ? 1 : 2 }}
          />

          {/* Tags */}
          <TagEditor
            isMobile={isMobile}
            selectedTags={localData.tags}
            setSelectedTags={handleTagsChange}
          />
        </Box>

        {/* Paragraphs */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            mb={isMobile ? 1 : 2}
          >
            Paragraphs (drag to reorder)
          </Typography>
          <Switch checked={editContent}
            onChange={() => dispatch(changeEditMode({editMode:!editContent?"advanced":"basic"}))}
          ></Switch></Stack>
        {editContent ?
          <div ref={modalRef}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => {
                setActiveId(null);
                handleDragEnd(e);
              }}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext
                items={localData.paragraphs.map((_, i) => String(i))}
                strategy={verticalListSortingStrategy}
              >
                {localData.paragraphs.map((p, idx) => {
                  const isDragged = draggedIndex === idx;
                  const isDragOver = dragOverIndex === idx && !isDragged;
                  const showCtrl = editingP !== idx;
                  return (
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 1,
                        m: isMobile ? 1 : 2,
                      }}
                    >
                      <DebouncedTextField
                        sx={{
                          // mt: 1,
                          "& .MuiInputBase-input": {
                            paddingTop: 2, // padding inside textarea
                            paddingBottom: 2, // padding inside textarea
                          },
                        }}
                        multiline
                        minRows={1}
                        maxRows={12}
                        fullWidth
                        value={p}
                        onChange={(e) => {
                          handleParagraphChange(idx, e.target.value);
                        }}
                        // label={`Paragraph ${idx + 1}`}
                        size={isMobile ? "small" : "medium"}
                        onFocus={(e) => setEditingP(idx)}
                        onBlur={(e) => setEditingP(null)}
                      />
                      {showCtrl && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 2,
                            left: 2,
                            width: "100%",
                            // backgroundColor: "#0ee3e380"
                          }}
                        >
                          <SortableItem id={String(idx)} isMobile={isMobile} p={p}>
                            <Box
                              sx={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "row",
                                gap: 0.5,
                                width: "100%",
                              }}
                            >
                              <Box
                                size={isMobile ? "small" : "medium"}
                                aria-label="drag handle"
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: "grab"
                                }}
                              // draggable
                              // onDragStart={() => handleDragStart(idx)}
                              // onDragEnd={handleDragEnd}
                              >
                                <DragIndicatorIcon
                                  sx={{ transform: "rotate(90deg)" }}
                                />
                              </Box>

                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                aria-label="move up"
                                onClick={() => moveParagraph(idx, idx - 1)}
                                color="primary"
                              >
                                <KeyboardArrowUpIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                aria-label="move down"
                                onClick={() => moveParagraph(idx, idx + 1)}
                                color="primary"
                              >
                                <KeyboardArrowDownIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </SortableItem>
                        </Box>
                      )}
                      {showCtrl && (
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
                    </Box>
                  );
                })}
              </SortableContext>
              {/* <DragOverlay container={modalRef.current}>
              {activeId != null ? (
                <OverlayItem paragraph={localData.paragraphs[Number(activeId)]} />
              ) : null}
            </DragOverlay> */}
            </DndContext>
          </div>
          :
          <Card
            sx={{
              overflowY: "auto",
              mt: isMobile ? 1 : 2,
              mb: isMobile ? 1 : 2,
              p: isMobile ? 1 : 2,
              minHeight: "30vh",
            }}
          >
            {renderParagraphs(localData, [])}
          </Card>
        }

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
        <Button onClick={() => handlePreview()}>Preview</Button>
        <Box>
          {onClose && (
            <Button
              variant="text"
              onClick={() => {
                setLocalData(data);
                onClose();
              }}
              // fullWidth={isMobile}
            >
              Cancel
            </Button>
          )}
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

      {showLogModal && (
        <TitleLogModal
          showLogModal={showLogModal}
          handleCloseLogModal={handleCloseLogModal}
          isMobile={isMobile}
          logs={logs}
          base={data}
          onRevert={(obj) => {
            setShowLog(false);
            setLocalData(obj);
          }}
        />
      )}

      {openPreview && (
        <PreviewModal
          open={openPreview}
          onClose={() => {
            setOpenPreview(false);
          }}
          title={localData}
        />
      )}

      {openDict && (
        <ReplaceModal
          open={openDict}
          onClose={() => setOpenDict(false)}
          onReplace={handleReplace}
        ></ReplaceModal>
      )}

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

const TagEditor = memo(function TagEditor({
  isMobile,
  selectedTags,
  setSelectedTags,
}) {
  console.log("TagEditor");

  const dispatch = useDispatch();

  // All available tags (from API or from store) used to suggest options
  const rawTags = useSelector(selectTags);
  const allTags = rawTags? rawTags.filter(tagObj => !tagObj.disabled) : [];

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

  const selectedOpts = [];
  if (selectedTags) {
    selectedTags.forEach(id => {
      var tagObj = allTags.find(t => t.id === id);
      if (tagObj) {
        selectedOpts.push(tagObj);
      }
    });
  }
  return (
    <Box sx={{ mb: isMobile ? 1 : 2 }}>
      <Autocomplete
        multiple
        // freeSolo
        getOptionLabel={(option) => option.tag}
        options={allTags}
        value={selectedOpts}
          onChange={(event, newValue) => {
            const ids = (newValue).map(opt=>opt.id);
            // console.log(ids)
            setSelectedTags(ids);
          }}
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
});

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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line" }}
            >
              • <HighlightWords text={s.replace(/^[-\s]+/, "")} words={words} />
            </Typography>
          )}
        </Box>
      );
    });
}

function PreviewModal({ open, onClose, title }) {
  console.log("PreviewModal");
  const rawTags = useSelector(selectTags);
  const allTags = rawTags? rawTags.filter(tagObj => !tagObj.disabled) : [];

  const tagDict = new Map();
  allTags.forEach(t => tagDict.set(t.id, t.tag));
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <MyModal open={open} onClose={onClose}>
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
        {renderTags(title, tagDict)}
      </Box>

      <Box
        sx={{ overflowY: "auto", mt: isMobile ? 1 : 2, mb: isMobile ? 1 : 2 }}
      >
        {renderParagraphs(title, [])}
      </Box>

      {/* Close bottom-right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="contained" fullWidth={isMobile} onClick={onClose}>
          OK
        </Button>
      </Box>
    </MyModal>
  );
}

// Deep comparison function
function dictsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].find !== b[i].find ||
      a[i].replace !== b[i].replace ||
      a[i].selected !== b[i].selected ||
      a[i].isReg !== b[i].isReg
    ) {
      return false;
    }
  }
  return true;
}

function ReplaceModal({ open, onReplace, onClose }) {
  console.log("ReplaceModal");
  const dispatch = useAppDispatch();
  const dict = useSelector(selectDict);

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
    setLocalDict([...localDict, { find: "", replace: "", selected: true }]);
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
    dispatch(setDict({ dict: localDict }));
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
    <MyModal open={open} onClose={onClose}>
      {/* Top right close button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 2,
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" mb={2}>
        Edit Dictionary
      </Typography>

      {/* pair */}
      <Box
        sx={{
          display: "flex",
          height: "50vh",
          flexGrow: 1,
          overflowY: "auto",
          flexDirection: "column",
          minHeight: "200px",
        }}
      >
        {localDict.map((pair, idx) => (
          <Paper
            key={idx}
            elevation={pair.selected ? 3 : 1}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              p: 1,
              // backgroundColor: pair.selected ? 'primary.light' : 'background.paper',
              cursor: "pointer",
            }}
            // onClick={() => handleToggleSelect(idx)}
          >
            <Tooltip title="Selected">
              <Checkbox
                checked={pair.selected}
                onChange={(e) => handleEdit(idx, "selected", e.target.checked)}
                size="small"
              />
            </Tooltip>
            <TextField
              label="Find"
              value={pair.find}
              size="small"
              onChange={(e) => handleEdit(idx, "find", e.target.value)}
              sx={{
                mr: 1,
                width: { xs: 80, sm: 120, md: 140 }, // responsive width
                flexShrink: 0,
              }}
            />
            <TextField
              label="Replace"
              value={pair.replace}
              size="small"
              onChange={(e) => handleEdit(idx, "replace", e.target.value)}
              sx={{
                mr: 1,
                minWidth: 80,
                flexGrow: 1, // grow ra
                flexBasis: 0, // chiếm phần còn lại
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, idx)}
              sx={{ flexShrink: 0 }}
            >
              <MoreVertIcon />
            </IconButton>
            {/* Menu cho từng dòng */}
            <Menu
              anchorEl={anchorEl}
              open={menuIdx === idx}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
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
              <MenuItem onClick={() => handleRemove(idx)}>
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
          display: "flex",
          justifyContent: "flex-end",
          gap: 2, // spacing between buttons
          mt: 2,
        }}
      >
        <Button onClick={handleAdd} variant="outlined">
          Add
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!isChanged}>
          Save
        </Button>
      </Box>

      {localDict.some((pair) => pair.selected) && (
        <Typography sx={{ mt: 2, overflow: "auto" }}>
          Replace:
          {localDict
            .filter((pair) => pair.selected)
            .map((pair) => ` "${pair.find}" -> "${pair.replace}"`)
            .join("; ")}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2, // spacing between buttons
          mt: 2,
        }}
      >
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => onReplace(localDict.filter((pair) => pair.selected))}
          variant="contained"
        >
          Replace
        </Button>
      </Box>
    </MyModal>
  );
}

function renderTags(title, tagDict) {
  var tags = [];
  if (title.tags) {
    title.tags.forEach(t=>{
      if (tagDict.has(t)) {
        tags.push(tagDict.get(t));
      }
    });
  }
  return tags.map((tag, idx) => (
    <Chip
      sx={{ mr: 1 }}
      label={tag}
      key={idx}></Chip>
  ));
}

function sortLogs(logs) {
  const sortedLogs = logs.map((log, idx) => ({
    idx,
    seconds: log.timestamp.seconds,
    label: tsToStr(log.timestamp),
  }));
  sortedLogs.sort((a, b) => b.seconds - a.seconds);
  return sortedLogs;
}

function tsToStr(ts) {
  const date = ts.toDate();
  const formatted = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  return formatted;
}

// Helper to style diffs
const PatchDecorator = (patchText, onHunk) => {
  const [content, setContent] = useState("");
  useEffect(() => {
    var hunkList = [];
    // Helper to determine line type and style accordingly
    function formatLine(line, idx, onHunk) {
      // Context
      var style = {};
      var onClick = () => {};
      if (line.startsWith("+") && !line.startsWith("+++")) {
        // Addition
        style = {
          background: "#e8f5e9",
          color: "#388e3c",
          // fontWeight: "bold"
        };
      }
      if (line.startsWith("-") && !line.startsWith("---")) {
        // Deletion
        style = {
          background: "#ffebee",
          color: "#d32f2f",
          // fontWeight: "bold"
        };
      }
      if (line.startsWith("@@")) {
        // Hunk header
        style = { background: "#e3f2fd", color: "#1976d2", fontWeight: "bold" };
        onClick = () => {
          onHunk([line]);
        };
        hunkList.push(line);
      }
      if (
        line.startsWith("diff") ||
        line.startsWith("index") ||
        line.startsWith("---") ||
        line.startsWith("+++")
      ) {
        // Metadata
        style = {
          background: "#f5f5f5",
          color: "#616161",
          fontStyle: "italic",
        };
      }
      return (
        <Typography
          key={idx}
          component="div"
          sx={{
            whiteSpace: "pre-line",
            ...style,
          }}
          onClick={onClick}
        >
          {line}
        </Typography>
      );
    }

    const lines = patchText.split("\n");
    var content = lines.map((line, idx) => formatLine(line, idx, onHunk));
    setContent(content);
  }, [patchText, onHunk]);
  return <>{content}</>;
};
function reorderObject(obj, order) {
  const newObj = {};

  for (const key of order) {
    if (key in obj) {
      newObj[key] = obj[key];
    }
  }

  // Optional: add keys not in order[]
  for (const key of Object.keys(obj)) {
    if (!(key in newObj)) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}
function ResolveModal({ open, patch, afterJson, onApply, onClose, isMobile }) {
  const [selectionLength, setSelectionLength] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hunkList, setHunkList] = useState([]);
  const inputRef = useRef(null);
  const [order, setOrder] = useState([
    "title",
    "path",
    "paragraphs",
    "tags",
    "titleId",
    "id",
  ]);

  const [json, setJson] = useState(afterJson);
  const [status, setStatus] = useState({});
  useEffect(() => {
    setJson(afterJson);
  }, [afterJson]);

  function handleCheck() {
    var { result, error } = rApplyPath(json, patch);
    if (result && isValidJSON(result)) {
      onApply(result);
    } else {
      setStatus({ error });
    }
  }
  function handleClose() {
    onClose();
  }
  const handleSelection = () => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      setSelectionLength(end - start);
      setCursorPosition(start);
    }
  };

  function handleReorder() {
    try {
      var newObj = JSON.parse(json);
      var newJson = JSON.stringify(reorderObject(newObj, order));
      setJson(newJson);
      var { result, error } = rApplyPath(newJson, patch);
      if (result && isValidJSON(result)) {
        setStatus({ success: "OK" });
      } else {
        setStatus({ error });
      }
    } catch (ex) {
      console.log(ex);
    }
  }
  function handleChangeOrder(lst) {
    setOrder(lst);
    var newObj = JSON.parse(json);
    var newJson = JSON.stringify(reorderObject(newObj, lst));
    setJson(newJson);
    var { result, error } = rApplyPath(newJson, patch);
    if (error) {
      setStatus({ error });
    } else if (isValidJSON(result)) {
      setStatus({ success: "OK" });
    } else {
      setStatus({ error: "Invalid JSON" });
    }
  }

  const handleHunk = useCallback(function handleHunk(hunkList) {
    // @@ -61,19 +61,8 @@
    setHunkList(hunkList);
    console.log(hunkList);
  }, []);

  return (
    <MyModal open={open} close={onClose}>
      {/* header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          justifyItems: "center",
        }}
      >
        <Typography variant="h6">{"Resolve conflict"}</Typography>
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
      {/* Body */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          minHeight: 300,
          flexDirection: "column",
        }}
      >
        {/* <TextField
      multiline={true}
      maxRows={10}
      value={decodeDiffText(patch)}
    >
    </TextField> */}
        <Card
          sx={{
            overflow: "auto",
            fontFamily: "monospace",
            minHeight: 100,
            // display: "flex",
            // flexDirection: "column",
            flex: 1,
            p: 1,
          }}
        >
          {PatchDecorator(decodeDiffText(patch), handleHunk)}
        </Card>

        {/* <TextField
            multiline={true}
            maxRows={10}
            value={json}
            onChange={(e) => setJson(e.target.value)}
            inputRef={inputRef}
            onSelect={handleSelection}
            onKeyUp={handleSelection}
            onClick={handleSelection}
            fullWidth
          >
          </TextField> */}
        <EditableHighlight
          value={json}
          hunkList={hunkList}
          onChange={(value) => setJson(value)}
        ></EditableHighlight>
      </Box>

      {/* ACTION */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <IconButton onClick={handleReorder} size="small">
          <RefreshIcon />
        </IconButton>
        <ChipDragSort
          value={order}
          onChange={handleChangeOrder}
          isMobile={isMobile}
        ></ChipDragSort>
      </Box>
      {/* ⭐ TITLEBAR BAR Ở DƯỚI */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          // borderTop: "1px solid #ddd",
          // p: 1,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", overflow: "auto" }}>
          <Typography
            color="error"
            sx={{
              whiteSpace: "pre-wrap",
              overflow: "auto",
            }}
          >
            {status.error && `[${status.error}]`}
          </Typography>
          <Typography
            color="success"
            sx={{
              whiteSpace: "pre-wrap",
              overflow: "auto",
            }}
          >
            {status.success && `[${status.success}]`}
          </Typography>
        </Box>
        {/* <Box>{`S: ${selectionLength} P: ${cursorPosition}`}</Box> */}
        {/* button FIX, CLOSE */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button onClick={handleClose}>Close</Button>
          <Button variant="contained" onClick={handleCheck}>
            Fix
          </Button>
        </Box>
      </Box>
    </MyModal>
  );
}
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.log(e);
    console.log(str);
    return false;
  }
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

  const [selected, setSelected] = useState(0);
  const [his, setHis] = useState();
  // const [options, setOptions] = useState([]);
  const [errObj, setErrObj] = useState();
  const [openResModal, setOpenResModal] = useState(false);

  useEffect(() => {
    var prev = stableStringify(base);
    var lst = [];
    try {
      for (var i = logs.length - 1; i >= 0; i--) {
        var patch = logs[i].patch;
        var { result } = rApplyPath(prev, patch);
        // console.log(i, patch, beforeJson);
        if (result && isValidJSON(result)) {
          prev = result;
          lst.push({
            content: result,
            note: patch,
            editor: "",
            time: tsToStr(logs[i].timestamp),
            version: `v${i + 1}`,
            idx: i,
          }); // content
        } else {
          setErrObj({ idx: i });
          break;
        }
      }
      setHis(lst);
    } catch (ex) {}
  }, [base, logs]);

  if (!his) {
    return <></>;
  }

  const options = his.map(({ time }, idx) => ({ idx, label: time }));

  // console.log("his", his)

  function handleUndo(idx) {
    setSelected(idx);
  }

  async function handleResolve(prev) {
    try {
      var lst = [...his];
      // console.log(prev)
      // udpate db
      var after = lst.length ? lst[lst.length - 1].content : null;
      var beforeObj = JSON.parse(prev);
      var newPatch = calcPath(beforeObj, after ? JSON.parse(after) : base);
      var logId = logs[errObj.idx].id;
      var updateRes = await updateTitleLog2(logId, { patch: newPatch });
      console.log(`update v${errObj.idx + 1}: `, logId, updateRes);

      lst.push({
        content: prev,
        note: logs[errObj.idx].patch,
        editor: "",
        time: tsToStr(logs[errObj.idx].timestamp),
        version: `v${errObj.idx + 1}`,
        idx: errObj.idx,
        resolved: true,
      });

      var err = null;
      for (var i = errObj.idx - 1; i >= 0; i--) {
        var patch = logs[i].patch;
        var { result } = rApplyPath(prev, patch);
        // console.log(i, patch, beforeJson);
        if (result && isValidJSON(result)) {
          // udpate db
          after = prev;
          newPatch = calcPath(JSON.parse(result), JSON.parse(after));
          logId = logs[i].id;
          updateRes = await updateTitleLog2(logId, { patch: newPatch });
          console.log(`update v${i + 1}: `, logId, updateRes);

          prev = result;
          lst.push({
            content: result,
            note: patch,
            editor: "",
            time: tsToStr(logs[i].timestamp),
            version: `v${i + 1}`,
            idx: i,
            resolved: true,
          }); // content
        } else {
          err = { idx: i };
          break;
        }
      }
      setHis(lst);
      setErrObj(err);
      setOpenResModal(false);
    } catch (ex) {
      console.log(ex);
    }
  }

  // function calcDiff(idx, afterJson) {
  //   var version = [afterJson];
  //   try {
  //     for (var i = logs.length - 1; i >= idx; i--) {
  //       var patch = logs[i].patch;
  //       var { result } = rApplyPath(version[0], patch);
  //       // console.log(i, patch, beforeJson);
  //       if (result) {
  //         version.splice(0, 0, result);
  //       } else {
  //         break;
  //       }
  //     }
  //   } catch (ex) { }
  //   return version.slice(0, 2);
  // }

  // restore prev version
  // var baseJson = JSON.stringify(base);
  // var [beforeJson, afterJson] = calcDiff(selected, baseJson);

  // if (!beforeJson || !afterJson) {
  //   return <div>Error</div>;
  // }
  // console.log(his, selected)
  const afterJson =
    selected === 0 ? JSON.stringify(base) : his[selected - 1].content;
  const beforeJson = his.length ? his[selected].content : null;

  // create diff
  var beforeStr = beforeJson ? titleToString(JSON.parse(beforeJson)) : "";
  var afterStr = titleToString(JSON.parse(afterJson));

  // const [selected, setSelected] = useState(0);
  return (
    <MyModal open={showLogModal} onClose={handleCloseLogModal}>
      {/* header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          justifyItems: "center",
        }}
      >
        <Typography variant="h6">{"Lịch sử chỉnh sửa"}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCloseLogModal}
          sx={{
            color: (theme) => theme.palette.grey[500],
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        direction={"row"}
        spacing={isMobile ? 1 : 2}
        sx={{ justifyContent: "space-between" }}
        display={"flex"}
      >
        <FormControl size="small">
          <InputLabel id="verison-select-label">Version</InputLabel>
          <Select
            sx={{ width: "fit-content" }}
            labelId="verison-select-label"
            label="Version"
            value={selected}
            onChange={(e) => handleUndo(e.target.value)}
            renderValue={(option) => {
              const idx = option;
              const date = logs[idx].timestamp.toDate();
              const formatted = `${date.getDate()}/${
                date.getMonth() + 1
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
                    <Radio checked={idx === selected}></Radio>
                    <Typography>{label}</Typography>
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        {errObj && (
          <Typography color="error" onClick={() => setOpenResModal(true)}>
            {`Conflit at: v${errObj.idx + 1}`}
          </Typography>
        )}
      </Box>
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
      {/* {OldDiffComp(beforeStr, afterStr)} */}
      <Card
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          overflowY: "auto",
          mt: 1,
          mb: 1,
        }}
      >
        {/* diff view */}
        {openResModal ? (
          <ResolveModal
            open={openResModal}
            afterJson={
              his.length ? his[his.length - 1].content : stableStringify(base)
            }
            patch={logs[errObj.idx].patch}
            onApply={handleResolve}
            onClose={() => setOpenResModal(false)}
            isMobile={isMobile}
          />
        ) : (
          <DiffView oldText={beforeStr} newText={afterStr} />
        )}
      </Card>

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
    </MyModal>
  );
}
const DebouncedTextField = ({ value, onChange, ...props }) => {
  const [text, setText] = useState(value);
  useEffect(() => {
    // historyRef.current=[p];
    // indexRef.current=0;
    setText(value);
  }, [value]);

  const debouncedText = useMemo(
    () =>
      debounce((e) => {
        onChange(e);
      }, 500),
    [onChange]
  );
  const handleChange = useCallback(
    (e) => {
      setText(e.target.value);
      debouncedText(e);
    },
    [debouncedText]
  );
  return <TextField value={text} onChange={handleChange} {...props} />;
};
const ParagraphEditor = memo(function ParagraphEditor({
  p,
  handleParagraphChange,
  idx,
  isMobile,
  insertParagraph,
  removeParagraph,
  moveParagraph,
  combineParagraph,
  handleDragStart,
  handleDragEnd,
}) {
  console.log("ParagraphEditor", idx);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(p);

  // Holds all history values
  const historyRef = useRef([p]);
  // Current position in history
  const indexRef = useRef(0);

  const [saveConfirm, setSaveConfirm] = useState(false);

  useEffect(() => {
    // historyRef.current=[p];
    // indexRef.current=0;
    setText(p);
  }, [p]);

  const onMoveUp = () => {
    moveParagraph(idx, idx - 1);
  };

  const onMoveDown = () => {
    moveParagraph(idx, idx + 1);
  };

  // Current text value
  // const text = history[currentIndex];

  const handleChange = (e) => {
    const newValue = e.target.value;
    setText(newValue);

    debouncedHis(newValue);
  };
  const debouncedHis = useMemo(
    () =>
      debounce((content) => {
        // If the user types after undo, truncate redo history
        // if (indexRef.current < historyRef.current.length - 1) {
        //   historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
        // }
        // historyRef.current.push(content);
        // indexRef.current = historyRef.current.length - 1;
        // console.log(historyRef.current.length)
        handleParagraphChange(idx, content);
      }, 500),
    [handleParagraphChange, idx]
  );

  // Undo (go back in history)
  const handleUndo = () => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setText(historyRef.current[indexRef.current]);
    }
  };

  // Redo (go forward in history)
  const handleRedo = () => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      setText(historyRef.current[indexRef.current]);
    }
  };

  const showHis = false; // historyRef.current.length > 1;
  const showCtrl = true;

  const handleBlur = () => {
    // if (editMode) {
    //   setSaveConfirm(true);
    // }
  };
  const handleSave = () => {
    console.log("save", text !== p);
    if (text !== p) {
      handleParagraphChange(idx, text);
    }
    historyRef.current = [p];
    indexRef.current = 0;
  };
  return (
    <Box prosition="relative" sx={{ mb: isMobile ? 1 : 2 }}>
      <TextField
        sx={{
          // mt: 1,
          "& .MuiInputBase-input": {
            paddingTop: 2, // padding inside textarea
            paddingBottom: 2, // padding inside textarea
          },
        }}
        multiline
        minRows={1}
        maxRows={12}
        // onInput={(e) => {
        //   const ta = e.target;
        //   ta.style.height = "auto";
        //   ta.style.height = `${ta.scrollHeight}px`;
        // }}
        onFocus={() => {
          // setIsFocused(true);
        }}
        onBlur={() => {
          // setIsFocused(false);
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
      {showHis && (
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
              // disabled={historyRef.current.length === 1}
              size={isMobile ? "small" : "medium"}
              aria-label="save"
              onClick={handleSave}
              color="primary"
            >
              {false ? (
                <ClearIcon fontSize="small" color="error" />
              ) : (
                <SaveIcon fontSize="small" />
              )}
            </IconButton>

            <IconButton
              disabled={indexRef.current === 0}
              size={isMobile ? "small" : "medium"}
              aria-label="undo"
              onClick={handleUndo}
              // color="secondary"
            >
              <UndoIcon fontSize="small" />
            </IconButton>

            <IconButton
              disabled={indexRef.current === historyRef.current.length - 1}
              size={isMobile ? "small" : "medium"}
              aria-label="redo"
              onClick={handleRedo}
              // color="secondary"
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      {showCtrl && (
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
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnd={handleDragEnd}
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
      {showCtrl && (
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

      {saveConfirm && (
        <Dialog
          open={saveConfirm}
          onClose={() => setSaveConfirm(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"UN-SAVED CONFIRM"}
          </DialogTitle>
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
        </Dialog>
      )}
    </Box>
  );
});

function MyModal({ open, onClose, children: Element }) {
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
          // maxHeight: isMobile ? "calc(var(--vh) * 90)" : "calc(var(--vh) * 80)",
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Element}
      </Box>
    </Modal>
  );
}

function OldDiffComp(beforeStr, afterStr) {
  var dmp = new diff_match_patch();
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
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        overflowY: "auto",
        margin: "8px 0 8px 0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          height: "fit-content",
          width: "50%",
        }}
      >
        <Box
          sx={{
            border: "1px solid",
            mr: 0.5,
            p: 0.5,
            height: "fit-content",
            borderRadius: "0.5rem",
            whiteSpace: "pre-line",
            minHeight: "50vh",
          }}
        >
          {left}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          height: "fit-content",
          width: "50%",
        }}
      >
        <Box
          sx={{
            border: "1px solid",
            mr: 0.5,
            p: 0.5,
            height: "fit-content",
            borderRadius: "0.5rem",
            whiteSpace: "pre-line",
            minHeight: "50vh",
          }}
        >
          {right}
        </Box>
      </Box>
    </div>
  );
}

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
  const handleDel = () => {};
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
  const rawTags = useSelector(selectTags);
  const allTags = rawTags? rawTags.filter(tagObj => !tagObj.disabled) : [];

  const tagDict = new Map();
  allTags.forEach(t=>tagDict.set(t.id,t.tag));
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
        {renderTags(t, tagDict)}
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

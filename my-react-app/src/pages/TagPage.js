import { useState } from "react";
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
} from "@mui/material";
import { Edit, Save, Add } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  addTag,
  editTag,
  selectTags,
} from "../features/search/searchSlice";
import {
  createTag,
  updateTag,
} from "../services/search/keyApi";
import { useAppDispatch } from "../app/hooks";
import CancelIcon from '@mui/icons-material/Cancel';

export default function TagPage() {
  const dispatch = useAppDispatch();
  const rawTags = useSelector(selectTags);
  //   console.log("Tags:", tags);
  const [newTag, setNewTag] = useState({});
  const [editing, setEditing] = useState({});

  // alert dialog
  const [alertObj, setAlertObj] = useState({ open: false });

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
    if (rawTags.find((t) => t.tag === newTag.tag.trim())) {
      setAlertObj({
        open: true,
        type: "error",
        message: "Duplicated tag: " + newTag.tag,
      });
      return; // avoid duplicates
    }

    const { result } = await createTag(newTag);
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
    if (!editing.tag.trim()) return;
    const { result } = await updateTag(editing.id, { tag: editing.tag });
    if (result) {
      dispatch(editTag({ id: editing.id, changes: { tag: editing.tag } }));
      setEditing({});
    }
  };
  const handleCancel = () => {
    setEditing({});
  }

  if (!rawTags) {
    return <div>Loading tags...</div>;
  }
  
  return (
    <Box sx={{
      p: isMobile ? 1 : 2,
      display: "flex",
      flexDirection: "column",
      width: "100%"
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Tag Manager
      </Typography>

      {/* Add Tag */}
      <Box sx={{ display:"flex", flexDirection: "column" }}>
        <Typography variant="subtitle1">
          Add Tag
        </Typography>
        <Box sx={{ display: "flex", m: isMobile?1:2, gap: 1 }}>
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
          p:isMobile?1:2
        }}>
          {rawTags.map((tagObj, index) => (
            <Box
              key={index}
              sx={{m:0}}
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
    </Box>
  );
}

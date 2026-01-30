import { useEffect, useState } from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import { Edit, Save, Add, MoreVert } from "@mui/icons-material";
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
import { ExportTagModal } from "../components/ExportTagModal";

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

  // const isMobile = useMediaQuery("(max-width:600px)");

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
              <TagItem
                key={index}
                index={index}
                editing={editing}
                tagObj={tagObj}
                setEditing={setEditing}
                handleSave={handleSave}
                handleCancel={handleCancel}
                toggleTag={toggleTag}
                handleExport={handleExport}
              />
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
function TagItem({
  index,
  editing,
  tagObj,
  setEditing,
  handleSave,
  handleCancel,
  toggleTag,
  handleExport,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menu = (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem
        onClick={() => {
          handleExport(tagObj);
          handleMenuClose();
        }}
      >
        Export
      </MenuItem>

      {/* <MenuItem
        onClick={() => {
          // handleDelete(tagObj.id);
          handleMenuClose();
        }}
        sx={{ color: "error.main" }}
      >
        Delete
      </MenuItem> */}
    </Menu>
  );

  return (
    <Box key={index} sx={{ m: 0 }}>
      {editing.id === tagObj.id ? (
        <Card
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            value={editing.tag}
            onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
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
        <Card
          sx={{
            p: 1,
            display: "flex",
            // justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Checkbox
            checked={!tagObj.disabled}
            onChange={() => toggleTag(tagObj.id, !tagObj.disabled)}
          ></Checkbox>
          <Typography sx={{flexGrow:1}} >{tagObj.tag}</Typography>
          <Stack direction="row">
            <IconButton onClick={() => setEditing(tagObj)}>
              <Edit />
            </IconButton>
            {/* <IconButton
                color="error"
                onClick={() => handleDel(tagObj.id)}
              >
                <Delete />
              </IconButton> */}

            {/* <Button variant="outlined" onClick={() => handleExport(tagObj)}>
              Export
            </Button> */}

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Stack>
        </Card>
      )}

      {menu}
    </Box>
  );
}


import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addTitle, changeMode, changeTitleId, editTitle, selectMode, selectTitleId, selectTitlesByIds } from "../features/search/searchSlice";
import { useEffect, useMemo, useState } from "react";
import { getTitle, updateTitle2 } from "../services/search/keyApi";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from "@mui/material";
import { TitleEditor } from "../components/TitleCard";
import debounce from "debounce";

export const TitlePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery("(max-width:600px)");

  const params = new URLSearchParams(window.location.search);
  const storeTitleId = useSelector(selectTitleId);
  const storeMode = useSelector(selectMode);
  const id = params.get("id") ? parseInt(params.get("id"), 10) : storeTitleId;
  const mode = params.get("mode") ? params.get("mode") : storeMode;
  // console.log("TitlePage mode, id:", mode, id);
 
  useEffect(() => {
    if (id && storeTitleId !== id) {
      // sync store titleId with url param id
      dispatch(changeTitleId({ titleId: id }));
    }

    if (mode && storeMode !== mode) {
      // sync store titleId with url param id
      dispatch(changeMode({ mode: mode }));
    }
  },[dispatch, id, mode, storeMode, storeTitleId])

  const titleIds = [id];
  const titles = useSelector((state) =>
    mode ? selectTitlesByIds(state, mode, titleIds) : []
  );
  const missingTitles = titles.length ? [] : titleIds;
  const missingTitlesStr = missingTitles.join(",");

  console.log("TitlePage missingTitlesStr:", missingTitlesStr);
  useEffect(() => {
    async function fetchTitle() {
      if (!missingTitlesStr) return;

      try {
        const ids = missingTitlesStr.split(",").map((s) => parseInt(s, 10));
        const results = await Promise.all(ids.map((id) => getTitle(id.toString(), mode)));

        // dispatch each successful result
        for (const res of results) {
          if (res && res.result) {
            dispatch(addTitle({ title: res.result, mode }));
          }
        }
      } catch (error) {
        console.error("Error fetching titles:", error);
      }
    }
    if (mode) {
      fetchTitle();
    }
  }, [dispatch, mode, missingTitlesStr]);

  // console.log("Rendering TitlePage with titles:", titles, "in mode:", mode);
  async function handleSave({ changes }) {
    var t = titles[0];
    if (Object.keys(changes).length) {
      var { result, error } = await updateTitle2(t, changes, mode);
      // console.log(result, error);
      if (result) {
        dispatch(editTitle({ id: t.titleId, changes, mode }));
      }
    }
  }

  function handleClose() {

  }

  if (!mode) {
    return (
      <Box sx={{ p: 2 }}>
        <h2>Please select a mode:</h2>
        <Button
          variant="contained"
          onClick={() => navigate(`/title?mode=QA&id=${id || 1}`)}
          sx={{ mr: 2 }}
        >
          QA Mode </Button>
        <Button
          variant="contained"
          onClick={() => navigate(`/title?mode=BBH&id=${id || 1}`)}
        >
          BBH Mode </Button>
      </Box>
    );
  }

  const handleIdChange = (id) => {
    navigate(`/title?mode=${mode}&id=${id}`);
  }

  return (
    <Box
    sx={{
          flexGrow: 1,
          // p: isMobile?1:2,
          display: "flex",
          flexDirection: "column",
        }}
    >
      <Box
        // alignItems={"center"}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "50vh"
        }}
      // fullWidth
      // spacing={2}
      >
        {/* control bar */}
        <Box 
        sx={{pt: isMobile? 2:3,
          display: "flex", 
          flexDirection: "row", 
          justifyContent:"center"}}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              onClick={() => {
                const curId = parseInt(id);
                if (curId <= 1) return;
                navigate(`/title?mode=${mode}&id=${curId - 1}`);
              }}
            >
              Trước
            </Button>

            {/* select mode */}
            <FormControl size="small">
              <InputLabel id="mode-select-label">Mode</InputLabel>
              <Select
                labelId="mode-select-label"
                label="Mode"
                value={mode}
                onChange={(e) => navigate(`/title?mode=${e.target.value}&id=1`)}
              >
                <MenuItem value="QA">QA</MenuItem>
                <MenuItem value="BBH">BBH</MenuItem>
              </Select>
            </FormControl>
            {/* 
            <CustomizedInputBase sx={{with: 50}} searchStr={id} onSearch={(strId)=>{
                const newId = parseInt(strId);
                navigate(`/title?mode=${mode}&id=${newId}`);
              }} ></CustomizedInputBase> */}
            <TitleIdInput
              id={id}
              onChangeId={handleIdChange}
            ></TitleIdInput>

            <Button
              onClick={() => {
                const newId = parseInt(id) + 1;
                navigate(`/title?mode=${mode}&id=${newId}`);
              }}
            >
              Tiếp
            </Button>
          </Stack>
        </Box>

        {/* title editor box */}
        {titles[0] && (
          <TitleEditor
            data={titles[0]}
            isMobile={isMobile}
            onSave={handleSave}
            onClose={handleClose}
          ></TitleEditor>
        )}
        {/* <Box
          sx={{
            // position: "absolute",
            // top: "50%",
            // left: "50%",
            // transform: "translate(-50%, -50%)",
            // width: isMobile ? "100%" : "80%",
            // maxWidth: "90vw",
            // fullWidth: true,
            bgcolor: "background.paper",
            // boxShadow: 24,
            mt: isMobile ? 1 : 2,
            // maxHeight: isMobile ? "80vh" : "70vh",
            // overflowY: "auto",
            borderRadius: 2,
            display: "flex",
            flexGrow: "9",
            flexDirection: "column"
          }}
        >
          {titles[0] && (
            <TitleEditor
              data={titles[0]}
              isMobile={isMobile}
              onSave={handleSave}
              onClose={handleClose}
            ></TitleEditor>
          )}
        </Box> */}
      </Box>
    </Box>
  );
};

// debounce
const TitleIdInput = ({ id, onChangeId }) => {
  const [inputId, setInputId] = useState(id);
  const debouncedSearch = useMemo(() => debounce(
    (zId) => {
      var nId = parseInt(zId);
      onChangeId(nId);
    }
    , 500), [onChangeId]);

  useEffect(() => {
      setInputId(id);
  }, [id]);

  const handleIdChange = (e) => {
    setInputId(e.target.value);
    debouncedSearch(e.target.value);
  }
  return <TextField
    label="Title ID"
    value={inputId}
    size="small"
    sx={{ width: 100 }}
    // onBlur={(e) => {
    //   const newId = parseInt(e.target.value);
    //   navigate(`/title?mode=${mode}&id=${newId}`);
    // }}
    onChange={handleIdChange}
  // onKeyDown={handleKeyDown}
  ></TextField>
}

// onblur
const TitleIdInput2 = ({ id, onChangeId }) => {
  const [inputId, setInputId] = useState(id);
  useEffect(() => {
    setInputId(id);
  }, [id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleIdChange(inputId);
    }
  };

  const handleIdChange = (zId) => {
    const newId = parseInt(zId);
    onChangeId(newId);
  }

  return <TextField
    label="Title ID"
    value={inputId}
    size="small"
    sx={{ width: 100 }}
    onBlur={(e) => {
      handleIdChange(e.target.value)
    }}
    onChange={(e) => setInputId(e.target.value)}
    onKeyDown={handleKeyDown}
  ></TextField>
}

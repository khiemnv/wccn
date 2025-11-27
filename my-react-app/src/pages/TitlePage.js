import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addTitle, changeMode, editTitle, selectMode, selectTitlesByIds } from "../features/search/searchSlice";
import { use, useEffect, useState } from "react";
import { getTitle, getTitleLog2, updateTitle2 } from "../services/search/keyApi";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Paper, Select, Stack, TextField, useMediaQuery } from "@mui/material";
import TitleCard, { TitleEditor } from "../components/TitleCard";
import { rApplyPath } from "../utils/fbUtil";

export const TitlePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isMobile = useMediaQuery("(max-width:600px)");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const mode = params.get("mode");

    const titleIds = [parseInt(id, 10)];
    const titles = useSelector((state) =>
        mode ? selectTitlesByIds(state, mode, titleIds):[]
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

    useEffect(() => {
        if (mode) {
            dispatch(changeMode({ mode }));
        }
    }, [dispatch, mode]);

    console.log("Rendering TitlePage with titles:", titles, "in mode:", mode);
    async function handleSave({ changes }) {
        var t = titles[0];
        if (Object.keys(changes).length) {
            var { result, error } = await updateTitle2(t, changes, mode);
            console.log(result, error);
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

    return (
        <>
            <Stack
                direction={"column"}
                alignItems={"center"}
                sx={{ height: "80vh", p: 2, flexGrow: 1 }}
            >

                {/* control bar */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* <FormControl size="small">
                    <InputLabel id="mode-select-label">Mode</InputLabel>
                    <Select
                        labelId="mode-select-label"
                        label="Mode"
                        value={mode}
                        onChange={(e) => dispatch(changeMode({ mode: e.target.value }))}
                    >
                        <MenuItem value="QA">QA</MenuItem>
                        <MenuItem value="BBH">BBH</MenuItem>
                    </Select>
                </FormControl> */}

                    <Button
                        onClick={() => {
                            const curId = parseInt(id);
                            if (curId <= 1) return;
                            navigate(`/title?mode=${mode}&id=${curId - 1}`);
                        }}
                    >
                        Trước
                    </Button>
                    <TextField
                        label="Title ID"
                        value={id}
                        size="small"
                        onChange={(e) => {
                            const newId = e.target.value;
                            navigate(`/title?mode=${mode}&id=${newId}`);
                        }}>
                    </TextField>
                    <Button
                        onClick={() => {
                            const newId = parseInt(id) + 1;
                            navigate(`/title?mode=${mode}&id=${newId}`);
                        }}
                    >
                        Tiếp
                    </Button>

                </Stack>

                {/* title editor box */}
                <Box
                    sx={{
                        // position: "absolute",
                        // top: "50%",
                        // left: "50%",
                        // transform: "translate(-50%, -50%)",
                        width: isMobile ? "90%" : 600,
                        maxWidth: "90vw",
                        bgcolor: "background.paper",
                        // boxShadow: 24,
                        p: isMobile ? 2 : 4,
                        // maxHeight: isMobile ? "90vh" : "80vh",
                        overflowY: "auto",
                        borderRadius: 2,
                    }}
                >
                    {
                        titles[0] && <TitleEditor
                            data={titles[0]}
                            isMobile={isMobile}
                            onSave={handleSave}
                            onClose={handleClose}></TitleEditor>
                    }
                </Box>
            </Stack>


        </>
    );
};

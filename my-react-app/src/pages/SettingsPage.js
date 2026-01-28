import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { changeAutoSave, changeParagraphViewMode, selectAutoSave, selectParagraphViewMode } from '../features/search/searchSlice';
import { useAppDispatch } from '../app/hooks';
import { Box, Checkbox, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, Typography } from '@mui/material';

  const PVmodes = [
  { value: 1, label: 'Preview' },
  { value: 2, label: 'Side by Side' },
  { value: 0, label: 'Diff' },
];

function SettingsPage() {
    const dispatch = useAppDispatch();
  // State for the Auto Save checkbox
  const autoSave = useSelector(selectAutoSave);
  const pvMode = useSelector(selectParagraphViewMode);

  // Simulate saving the setting (replace with real API call if needed)
  const handleAutoSaveChange = (e) => {
    const checked = e.target.checked;
    dispatch(changeAutoSave({autoSave:checked}));
  };

  const handlePVMChange = (event) => {
    dispatch(changeParagraphViewMode({paragraphViewMode:Number(event.target.value)}));
  };

  return (
<Box
  sx={{
    p: 2,
    width: "100%",
    display: "flex",
    justifyContent: "center",
  }}
>
  <Box sx={{ width: "100%", maxWidth: 640 }}>
    <Typography
      variant="h5"
      sx={{ mb: 2, fontWeight: 700 }}
    >
      Settings
    </Typography>

    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Auto Save section */}
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoSave}
              onChange={handleAutoSaveChange}
            />
          }
          label={
            <Typography fontWeight={600}>
              Auto Save
            </Typography>
          }
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: 4, mt: 0.5 }}
        >
          {autoSave
            ? "Changes are saved automatically."
            : "You need to save changes manually."}
        </Typography>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          height: 1,
          bgcolor: "divider",
          my: 1,
        }}
      />

      {/* View Mode section */}
      <FormControl>
        <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
          View Mode
        </FormLabel>

        <RadioGroup
          row
          value={pvMode}
          onChange={handlePVMChange}
          sx={{ gap: 2 }}
        >
          {PVmodes.map((mode) => (
            <FormControlLabel
              key={mode.value}
              value={mode.value}
              control={<Radio />}
              label={mode.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  </Box>
</Box>

  );
}

export default SettingsPage;
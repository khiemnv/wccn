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
  const Pviewmode = useSelector(selectParagraphViewMode);

  // Simulate saving the setting (replace with real API call if needed)
  const handleAutoSaveChange = (e) => {
    const checked = e.target.checked;
    dispatch(changeAutoSave({autoSave:checked}));
  };

  const handlePVMChange = (event) => {
    dispatch(changeParagraphViewMode({paragraphViewMode:Number(event.target.value)}));
  };

  return (

    <Box sx={{
      p: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%"
    }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Settings
        </Typography>
<Paper
        sx={{
          p: 3,
          maxWidth: 600,
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        elevation={3}
      >
        
        <FormControlLabel
          control={
            <Checkbox
              checked={autoSave}
              onChange={handleAutoSaveChange}
              color="primary"
            />
          }
          label="Auto Save"
          sx={{ alignSelf: 'flex-start', mt: 1 }} // align left if you prefer, otherwise remove
        />

        <Box mt={1.5} mb={2} width="100%">
          <Typography align="center">
            {autoSave ? 'Auto Save is ON.' : 'Auto Save is OFF.'}
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend">View Mode</FormLabel>
          <RadioGroup
            row
            value={Pviewmode}
            onChange={handlePVMChange}
            name="view-mode"
            sx={{ justifyContent: 'center' }}
          >
            {PVmodes.map((mode) => (
              <FormControlLabel
                key={mode.value}
                value={mode.value}
                control={<Radio color="primary" />}
                label={mode.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
      </Box>
  );
}

export default SettingsPage;
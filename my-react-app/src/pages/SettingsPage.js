import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { changeAutoSave, selectAutoSave } from '../features/search/searchSlice';
import { useAppDispatch } from '../app/hooks';

function SettingsPage() {
    const dispatch = useAppDispatch();
  // State for the Auto Save checkbox
  const autoSave = useSelector(selectAutoSave);

  // Simulate saving the setting (replace with real API call if needed)
  const handleAutoSaveChange = (e) => {
    const checked = e.target.checked;
    dispatch(changeAutoSave({autoSave:checked}));
  };

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>Settings</h2>
      <label>
        <input
          type="checkbox"
          checked={autoSave}
          onChange={handleAutoSaveChange}
        />
        Auto Save
      </label>
      <div style={{ marginTop: 12 }}>
        {autoSave ? 'Auto Save is ON.' : 'Auto Save is OFF.'}
      </div>
    </div>
  );
}

export default SettingsPage;
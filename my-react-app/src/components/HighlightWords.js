import React, { memo, useEffect, useRef, useState } from "react";
import { Box, Card, Typography } from "@mui/material";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightWords({ text, words }) {
  if (!words || words.length === 0) return <>{text}</>;

  // Build regex that matches any of the words
  const pattern = words.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = String(text).split(regex);

  return (
    <>
      {parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <Typography
            key={i}
            component="span"
            sx={{ backgroundColor: "yellow", fontWeight: "bold" }}
          >
            {part}
          </Typography>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
function parseHunk(hunk) {
  const regex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/;
  const m = hunk.match(regex);

  if (!m) return {newStart:0, newLines:0};

  return {
    oldStart: parseInt(m[1], 10),
    oldLines: parseInt(m[2], 10),
    newStart: parseInt(m[3], 10),
    newLines: parseInt(m[4], 10)
  };
}
function applyHighlights(text, hunkList) {
  if (!hunkList || hunkList.length === 0) {
    return escapeHtml(text);
  }

  // x? l? highlight nh? b?nh th??ng
  let ranges = [];

  for (const h of hunkList) {
    const info = parseHunk(h);
    if (!info) continue;

    const charStart = info.newStart;
    const charLen = info.newLines;

    ranges.push({ start: charStart, len: charLen });
  }

  // Sort ranges by position
  ranges.sort((a, b) => a.start - b.start);

  // Build HTML
  let html = "";
  let lastIndex = 0;
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }
  for (let r of ranges) {
    html += escapeHtml(text.slice(lastIndex, r.start));
    html += `<span style="background: yellow;">${escapeHtml(text.slice(r.start, r.start + r.len))}</span>`;
    lastIndex = r.start + r.len;
  }

  html += escapeHtml(text.slice(lastIndex));

  return html;
}
function getCursorPosition(editableDiv) {
  let pos = 0;
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();

  preRange.selectNodeContents(editableDiv);
  preRange.setEnd(range.endContainer, range.endOffset);

  pos = preRange.toString().length;
  return pos;
}
function getSelectedLength() {
  const selection = window.getSelection();
  return selection ? selection.toString().length : 0;
}

export function EditableHighlight({value, hunkList, onChange}) {
  const ref = useRef(null);
  const [plainText, setPlainText] = useState(value);
  const [cursorPos, setCursorPos] = useState(0);
  const [selectLen, setSelectLen] = useState(0);

  console.log("EditableHighlight")
  
  useEffect(() => {
    setPlainText(value);
    const updateHighlight = () => {
      if (!ref.current) return;

      const html = applyHighlights(value, hunkList);
      ref.current.innerHTML = html;
    };
    updateHighlight();
  }, [hunkList, value]);




  const updateSelectionInfo =() => {
    if (!ref.current) return;

    const len = getSelectedLength();
    const pos = getCursorPosition(ref.current);

    setCursorPos(pos);
    setSelectLen(len);
  };

  return (
    <>
      <Card
        ref={ref}
        contentEditable
        sx={{
          minHeight: 100,
          // border: "1px solid #ccc",
          // padding: "10px",
          whiteSpace: "pre-wrap",
          outline: "none",
          // fontFamily: "monospace",
          overflow: "auto",
          mt: 1,
          p: 1,
        }}
        onInput={(e) => {
          const text = e.target.innerText; // get plain text (no HTML)
          onChange(text);
        }}
        
        onKeyUp={updateSelectionInfo}
        onMouseUp={updateSelectionInfo}
        onSelect={updateSelectionInfo}
      />
      <Box
        sx={{display: "flex", 
          justifyContent: "flex-end"}}
      >
        Cursor: {cursorPos} &nbsp; | &nbsp;
        Selected: {selectLen}
      </Box>
    </>
  );
}
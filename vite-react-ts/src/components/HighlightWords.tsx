import { useEffect, useRef, useState } from "react";
import { Box, Card, Typography } from "@mui/material";

type HighlightWordsProps = {
  text: string;
  words: string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

export default function HighlightWords({ text, words }: HighlightWordsProps) {
  if (!words || words.length === 0) return <>{text}</>;

  const pattern = words.map(escapeRegExp).join("|");
  const parts = String(text).split(new RegExp(`(${pattern})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <Typography
            key={index}
            component="span"
            sx={{ backgroundColor: "yellow", fontWeight: "bold" }}
          >
            {part}
          </Typography>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

type HunkInfo = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

function parseHunk(hunk: string): HunkInfo | null {
  const regex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/;
  const m = hunk.match(regex);
  if (!m) return null;

  return {
    oldStart: parseInt(m[1], 10),
    oldLines: parseInt(m[2], 10),
    newStart: parseInt(m[3], 10),
    newLines: parseInt(m[4], 10),
  };
}

function escapeHtml(str: string) {
  const mapping: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return str.replace(/[&<>]/g, (char) => mapping[char]);
}

function applyHighlights(text: string, hunkList?: string[]) {
  if (!hunkList || hunkList.length === 0) {
    return escapeHtml(text);
  }

  const ranges: { start: number; len: number }[] = [];

  for (const h of hunkList) {
    const info = parseHunk(h);
    if (!info) continue;
    ranges.push({ start: info.newStart, len: info.newLines });
  }

  ranges.sort((a, b) => a.start - b.start);

  let html = "";
  let lastIndex = 0;

  for (const range of ranges) {
    html += escapeHtml(text.slice(lastIndex, range.start));
    html += `<span style="background: yellow;">${escapeHtml(
      text.slice(range.start, range.start + range.len)
    )}</span>`;
    lastIndex = range.start + range.len;
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function getCursorPosition(editableDiv: HTMLDivElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(editableDiv);
  preRange.setEnd(range.endContainer, range.endOffset);

  return preRange.toString().length;
}

function getSelectedLength() {
  const selection = window.getSelection();
  return selection ? selection.toString().length : 0;
}

type EditableHighlightProps = {
  value: string;
  hunkList?: string[];
  onChange: (value: string) => void;
};

export function EditableHighlight({ value, hunkList, onChange }: EditableHighlightProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState(0);
  const [selectLen, setSelectLen] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const html = applyHighlights(value, hunkList);
    ref.current.innerHTML = html;
  }, [hunkList, value]);

  const updateSelectionInfo = () => {
    if (!ref.current) return;
    setCursorPos(getCursorPosition(ref.current));
    setSelectLen(getSelectedLength());
  };

  return (
    <>
      <Card
        ref={ref}
        contentEditable
        sx={{
          minHeight: 100,
          whiteSpace: "pre-wrap",
          outline: "none",
          overflow: "auto",
          mt: 1,
          p: 1,
        }}
        onInput={(event) => {
          const text = event.currentTarget.innerText;
          onChange(text);
        }}
        onKeyUp={updateSelectionInfo}
        onMouseUp={updateSelectionInfo}
        onSelect={updateSelectionInfo}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        Cursor: {cursorPos} &nbsp; | &nbsp; Selected: {selectLen}
      </Box>
    </>
  );
}

import React from "react";
import { Typography } from "@mui/material";

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

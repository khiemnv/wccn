import React from "react";
import { Box, Paper, Typography } from "@mui/material";

// PhamThiYenVideoPlayer.jsx
// - Renders article content (title, date, excerpt) and an embedded video player.
// - If `videoSrc` is provided (mp4 / webm / HLS), it will use the native <video> player.
// - Otherwise it will show an iframe embedding the original page as a fallback.

export default function VideoArticle({
  title = "Video Title",
  videoSrc = "", // direct URL to .mp4/.m3u8/etc. If empty, the original page will be embedded in an iframe.
  width = "100%",
  height = 480,
  className = "",
  content = "",
  pageUrl = "",
}) {
  // Convert YouTube URL to embed format if applicable
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("drive.google.com/file/d/")) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1])
          return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoSrc);

  // compute a sensible aspect ratio (use provided numeric width/height when available)
  const aspectRatio =
    typeof width === "number" && typeof height === "number"
      ? `${width} / ${height}`
      : "16 / 9";

  const containerWidth = typeof width === "number" ? width : "100%";

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: containerWidth,
            maxWidth: "100%",
            aspectRatio: aspectRatio,
            bgcolor: "transparent",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: 1,
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="video player"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                background: "#000",
              }}
            >
              {videoSrc && <source src={videoSrc} />}
              Your browser does not support the video tag.
            </video>
          )}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {videoSrc
          ? ""
          : "Embedded page fallback — pass a direct video URL in videoSrc for native playback."}
      </Typography>

      <Box
        component="pre"
        sx={{
          whiteSpace: "pre-wrap",
          color: "text.primary",
          bgcolor: "background.default",
          p: 2,
          borderRadius: 1,
          overflowX: "auto",
          fontFamily: "inherit",
        }}
      >
        {content}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2 }}
      >
        {pageUrl ? `Source: ${pageUrl}` : ""}
      </Typography>
    </Box>
  );
}

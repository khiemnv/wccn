import React from "react";
import { Link } from "react-router-dom";

function PostCard({ post }) {
  return (
    <div style={styles.card}>
      <h3>
        <Link to={`/post/${post.slug}`} style={styles.title}>
          {post.title}
        </Link>
      </h3>
      <p>{post.excerpt}</p>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    background: "#fff"
  },
  title: {
    textDecoration: "none",
    color: "#333"
  }
};

export default PostCard;

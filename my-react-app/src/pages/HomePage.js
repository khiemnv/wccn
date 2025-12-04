import React from "react";
import PostCard from "../components/PostCard";
import { Box } from "@mui/material";

const latestPosts = [
  {
    title: "Xuất gia báo hiếu: Con đường đưa cha mẹ thoát luân hồi",
    slug: "xuat-gia-bao-hieu",
    excerpt: "Người xuất gia báo hiếu cha mẹ không chỉ một đời mà còn nhiều đời…"
  },
  {
    title: "Vu Lan trẩy hội hiếu: Nguyện mong cha mẹ được nương tựa Phật Pháp",
    slug: "vu-lan-tray-hoi",
    excerpt: "Các cha mẹ cùng các Phật tử đã cùng tụng kinh hồi hướng…"
  }
];

function HomePage() {
  return (
    <Box
      sx={{
        p: 2,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section>
        <h2>Giới thiệu</h2>
        <p>
          Trang web phamthiyen.com đăng tải các bài viết, video hướng dẫn cách
          áp dụng Phật Pháp vào cuộc sống.
        </p>
      </section>

      <section>
        <h2>Bài mới nhất</h2>
        <div style={styles.grid}>
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </Box>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px"
  }
};

export default HomePage;

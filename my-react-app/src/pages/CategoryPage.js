import React from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";

const fakeData = {
  "chuong-trinh-tu-tap": [
    {
      title: "Khóa tu mùa hè cho thanh thiếu niên",
      slug: "khoa-tu-mua-he",
      excerpt: "Chương trình đặc biệt cho giới trẻ học Phật pháp..."
    }
  ],
  "nghi-le": [
    {
      title: "Nghi thức cúng rằm tháng Giêng",
      slug: "nghi-thuc-ram-thang-gieng",
      excerpt: "Hướng dẫn thực hành nghi lễ cúng rằm..."
    }
  ]
};

function CategoryPage() {
  const { slug } = useParams();
  const posts = fakeData[slug] || [];

  return (
    <div>
      <h2>Danh mục: {slug.replace(/-/g, " ")}</h2>
      {posts.length === 0 ? (
        <p>Chưa có bài viết</p>
      ) : (
        <div style={styles.grid}>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
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

export default CategoryPage;

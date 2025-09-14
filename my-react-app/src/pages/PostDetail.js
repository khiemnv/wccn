import React from "react";
import { useParams } from "react-router-dom";

const fakePosts = {
  "xuat-gia-bao-hieu": {
    title: "Xuất gia báo hiếu",
    content: "Nội dung chi tiết bài viết Xuất gia báo hiếu..."
  },
  "vu-lan-tray-hoi": {
    title: "Vu Lan trẩy hội hiếu",
    content: "Nội dung chi tiết bài viết Vu Lan..."
  }
};

function PostDetail() {
  const { slug } = useParams();
  const post = fakePosts[slug];

  if (!post) return <p>Không tìm thấy bài viết</p>;

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
    </article>
  );
}

export default PostDetail;

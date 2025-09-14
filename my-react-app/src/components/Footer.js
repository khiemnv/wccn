import React from "react";

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>Hotline: 038 669 0818</p>
      <p>
        © 2018 - Website được tạo bởi <b>Phạm Thị Yến (Tâm Chiếu Hoàn Quán)</b>
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#333",
    color: "#bbb",
    textAlign: "center",
    padding: "20px",
    marginTop: "40px"
  }
};

export default Footer;

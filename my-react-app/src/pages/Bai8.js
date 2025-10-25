// LinkListTuPhap.jsx
import React from "react";
import VideoArticle from "../components/VideoArticle";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function Bai8() {
  const [data, setData] = React.useState();

  return (
    <>
      <div className="container mx-auto p-4">
        <Typography variant="h4" gutterBottom>
          Quyển 7 – Link các ngày nghe Pháp – Nghi thức tu tập sám hối chuyển
          hóa (Bài tu số 8)
        </Typography>

        <Paper elevation={2} sx={{ mt: 2, mb: 2, p: 2 }}>
          {/* Dropdown select */}
          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel id="day-select-label">Chọn ngày</InputLabel>
            <Select
              labelId="day-select-label"
              label="Chọn ngày"
              value={data?.day ?? ""}
              onChange={(e) => {
                const sel = links.find((l) => l.day === e.target.value);
                setData(sel);
              }}
              renderValue={(selected) => {
                const sel = links.find((l) => l.day === selected);
                if (!sel) return "";
                return (
                  <Box component="span" sx={{ display: "inline" }}>
                    <strong>{sel.day}:</strong>&nbsp;{sel.title}
                  </Box>
                );
              }}
            >
              {links.map((item, idx) => (
                <MenuItem key={idx} value={item.day}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {data?.day === item.day ? <VisibilityIcon color="primary" /> : null}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: "inline" }}>
                        <strong>{item.day}:</strong>&nbsp;{item.title}
                      </Box>
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {data && (
            <VideoArticle
              title={data.title}
              videoSrc={data.url}
              width="100%"
              height={480}
              content={data.content}
            />
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Nguồn: phamthiyen.com
          </Typography>
        </Paper>
      </div>
    </>
  );
}
const day2and3 = {
    pageurl: "",
    title: "Quả Của Thiện Nghiệp Và Ác Nghiệp Rất Lạ Lùng | Nhân quả và nghiệp báo",
    url: "https://youtu.be/nlMy6ZR0ecA",
    content: ''
}
const day17 = {
  pageurl:
    "https://phamthiyen.com/video-giu-vung-tinh-tan-chu-ky-8-chuong-trinh-4-c3286.html",
  title: "[Video] Giữ vững tinh tấn - Chu kỳ 8 | Chương trình 4",
  url: "https://youtu.be/KUfRJ2AlYtA",
  content: `– Ngày 3:
Đề mục quán giúp tăng thượng Tâm, tăng thượng Trí:
1. Quán phiền não, ràng buộc thiêu đốt của cuộc sống tại gia, vợ chồng, con cái và tham tạo, giữ tài sản.
2. Quán chiếu: Mình có còn nhiều thèm khát, mong muốn cuộc sống phàm tục không?
3. Quán chiếu: Đối với việc phạm hạnh, khổ hạnh, phận sự, mình có bị phiền não, sợ hãi, thối lui không?
4. Quán chiếu: Tâm tham dục, bất thiện trong hiện tại sẽ dẫn mình đi về đâu trong 3 đường ác?
– Ngày 4:
Đề mục quán giúp tăng thượng Tâm, tăng thượng Trí:
1. Quán chiếu tâm lười biếng tu học phạm hạnh, phận sự của mình.
2. Khởi sinh sợ hãi tâm lười biếng tu học phạm hạnh, phận sự vì nó sẽ dẫn mình vào sâu vô minh, đau khổ.
3. Khởi sinh tâm tinh tấn tu học phạm hạnh, phận sự trong duyên của mình.
4. Nguyện mong được thân cận các bậc thiện hữu tri thức
5. Quán chiếu về lợi ích của Phật Pháp, khởi niệm mong muốn chánh Pháp trụ lâu dài ở thế gian để giác ngộ cứu khổ cho chúng sinh.
Khởi tâm tri ân Phật, chư tổ, Sư Phụ, chư Tăng và các bậc thiện hữu tri thức đã giúp cho mình được duyên tu học Phật Pháp.
* Sau khi thiền quán, tùy duyên thiền hành.
----------
Kinh Phật Khuyên Bảy Vị Tỳ-kheo Dứt Thối Chí
Thuở xưa, có bảy vị Tỳ-kheo vào núi học đạo. Trải qua mười hai năm mà họ vẫn chưa đắc đạo, nên bàn với nhau rằng:
- Học đạo thật khó, phải hủy bỏ hình hài, giữ lấy tiết tháo, chịu đựng nóng lạnh, trọn đời khất thực thọ nhục đủ điều. Nếu rốt cuộc không đắc đạo, thì tội nghiệp vẫn còn nguyên, chỉ luống tự lao nhọc, bỏ mạng trong núi. Chi bằng chúng ta hãy trở về nhà làm ăn, lấy vợ sinh con, lo làm giàu để hưởng sung sướng, sau này ra sao thì ra.
Bàn xong, bảy người cùng rời khỏi núi. Đức Phật ở xa biết họ có thể hóa độ. Nếu không nhẫn được cái khổ nhỏ, họ sẽ đọa vào địa ngục thật đáng tiếc thương. Đức Phật liền hóa ra một vị Sa-môn đứng ngay ở đầu khe núi. Bảy người đi ra liền gặp. Hóa Sa-môn hỏi:
- Các vị tu hành đã lâu sao lại bỏ núi đi?
Bảy người đáp:
- Học đạo cực khổ mà không nhổ được gốc tội, việc khất thực thọ nhục khó nhẫn. Lại nữa, trong núi không ai cúng dường, bao năm chật vật, luôn sống thiếu thốn, chỉ cực khổ suông mà không đắc đạo. Nên chúng tôi muốn về nhà làm ăn thật giàu có, rồi già mới tu lại.
Hóa Sa-môn nói:
- Hãy thôi! Hãy thôi! Nghe tôi nói đây. Mạng người vô thường sớm còn tối mất, học đạo tuy khó, trước khổ sau vui. Gia nghiệp khó khăn muôn kiếp khó dứt. Nếu mong cùng vợ con sum họp hưởng lạc, mong sung sướng mãi không gặp tai họa thì khác nào trị bệnh mà uống độc dược, chỉ nặng thêm không chút thuyên giảm. Trong ba cõi, có thân là có ưu não, chỉ có giữ tròn giới hạnh, không phóng dật tinh tấn tu hành, chứng được đạo quả mới chấm dứt tất cả khổ.
Bấy giờ, hóa Sa-môn liền hiện lại tướng Phật, hào quang rực rỡ nói kệ rằng:
Tu khó, hết tội khó
Ở nhà cũng khó khăn
Sum họp hưởng lợi khó
Gian nan nhất: Có thân.
Tỳ-kheo khất thực khó
Đâu thể không gắng công
Tinh tấn đến tự tại
Không đòi hỏi phiền ai.
Có tín, thành tựu giới
Từ giới, pháp bảo sinh
Nhờ đó sống an ổn
Được cung kính cúng dường.
Ngồi nằm hay đi đứng
Không phóng dật tinh cần
Luôn chính tâm giữ đạo
An vui sống núi rừng.
Lúc ấy, bảy vị Tỳ-kheo thấy thân tướng Phật, lại nghe kệ này nên hết sức hổ thẹn, run sợ vội quỳ mọp sát đất lễ dưới chân Phật, hết lòng sám hối rồi lễ Phật ra đi. Họ trở vào núi dụng “tử công phu”, tinh tấn tu tập, tư duy ý nghĩa bài kệ trên, chính tâm chuyên nhất, an trú tịch diệt, chứng quả A-la-hán.
Nam mô Phật Bổn Sư Thích Ca Mâu Ni!
(Trích soạn từ: Kinh Pháp cú thí dụ, Quyển Thứ Ba, Phẩm Địa Ngục Thứ 32, Thí dụ 57, tr.265-268, Việt dịch: Thích Minh Quang, Nxb. Tôn Giáo, Hà Nội, 2012)
----------
Xem thêm các bài kinh:
Chương trình tu mùa hạ: theo kinh Bát Đại Nhân Giác
Kinh Tám Điều Giác Ngộ Của Bậc Đại Nhân
Kinh Phật Dạy Chứa Của Báu Nhiều Không Bằng Thấy Đạo
Kinh Vô Ngã Tướng (Anattalakkhaṇa Sutta) - Ta Đi Tìm Ta, Ta Là Ai?
Kinh Phật Dạy Không Có Gì Khổ Hơn Có Thân
Kinh Phật Độ Một Vị Sa Môn Tham Của Bỏ Đạo
Kinh Vua Ba Tư Nặc Vâng Lời Phật Dạy Giảm Ăn
Kinh Ba Người Trả Quả Vì Mắng Nhiếc Bà Lão
Kinh Cư Sĩ Chứng Quả Dự Lưu
Kinh Phật Khuyên Bảy Vị Tỳ-kheo Dứt Thối Chí
Kinh Ông Bà La Môn Ngu Ám Vô Duyên Với Phật
Kinh Phật Dùng Phương Tiện Để Độ Phạm Chí Trẻ Tuổi
Kinh Chuyện Nữ Ngạ Quỷ Serinì
Kinh Mi Tiên Vấn Đáp - Đức Thế Tôn Có Tâm Đại Bi Hay Không?
Kinh Con Vượn Và Chiếc Bẫy
Kinh Phật Khen Sự Thọ Trì Bát Quan Trai Của Mạc Lợi Phu Nhân
Kinh Ngũ Vương - Nhận Diện Khổ Của Cuộc Đời
Kinh Kim Quang Minh Tối Thắng Vương - Bố Thí Thân Mạng Cầu Vô Thượng Bồ Đề
Kinh Aṅgulimāla (Aṅgulimāla Sutta) - Năng Lực Độ Sinh Từ Pháp Quy Y Và Trì Giới
`,
};

const links = [
  {
    day: "Ngày 2 và ngày 3",
    ...day2and3,
  },
  {
    day: "Ngày 5 và ngày 6",
    title:
      "Cách quán chiếu nhận biết kết quả tu tập | Trạch Pháp ngày 20/4/Qúy Mão",
    url: "#",
  },
  {
    day: "Ngày 8 và ngày 9",
    title:
      "Cần giác ngộ nhân duyên quyến thuộc và cách hành xử đúng pháp | Trạch Pháp ngày 20/5/Qúy Mão",
    url: "#",
  },
  {
    day: "Ngày 11",
    title:
      '"Vua Ba Tư Nặc Chữa Bệnh Béo Phì" - Tuổi trẻ khám phá vườn tâm kỳ 10',
    url: "#",
  },
  {
    day: "Ngày 12",
    title: "Cách chuyển hóa bệnh tật theo lời Phật dạy",
    url: "#",
  },
  {
    day: "Ngày 14",
    title: "Chuyện Đề Bà Đạt Đa hãm hại Phật và bài học ý nghĩa đằng sau",
    url: "#",
  },
  {
    day: "Ngày 15",
    title:
      "Vì sao xuất hiện suy nghĩ xấu về Đức Phật và cách loại trừ tâm bất thiện",
    url: "#",
  },
  {
    day: "Ngày 17",
    ...day17,
  },
  {
    day: "Ngày 18",
    title: "Tinh tấn tu học Phật Pháp để tầm cầu giác ngộ",
    url: "#",
  },
  {
    day: "Ngày 20 và ngày 21",
    title: "Pháp thoại: Khẩu nghiệp và quả báo",
    url: "#",
  },
  {
    day: "Ngày 23 và ngày 24",
    title: '"Điều phục chính mình" - Tuổi trẻ khám phá vườn tâm kỳ 8',
    url: "#",
  },
  { day: "Ngày 26", title: "Sóng gió tình ái cản trở xuất gia", url: "#" },
  {
    day: "Ngày 27",
    title: "Đoạn tình cảm để giữ vững chí nguyện xuất gia",
    url: "#",
  },
  {
    day: "Ngày 29",
    title: "Thế nào là quy y Tam Bảo và lợi ích quy y Tam Bảo?",
    url: "#",
  },
  {
    day: "Ngày 30",
    title: "Giới là gì và lợi ích của việc giữ gìn ngũ giới?",
    url: "#",
  },
  {
    day: "Ngày 32 và ngày 33",
    title:
      "Số kiếp luân hồi - Sự thống khổ cần giác ngộ | Chu kỳ 13 - Chương trình 2",
    url: "#",
  },
  {
    day: "Ngày 35",
    title: "Chuyển hóa cảm xúc tham dâm dục nhờ tu tập Phật Pháp",
    url: "#",
  },
  { day: "Ngày 36", title: "Tình yêu hay tình dục?", url: "#" },
  { day: "Ngày 38", title: "Buông bỏ tham ái, thoát lìa khổ đau", url: "#" },
  {
    day: "Ngày 39",
    title:
      'Bài 6: Buông bỏ "gia duyên" hướng tới "duyên tu" | Tu tập tại rừng lần 2',
    url: "#",
  },
  {
    day: "Ngày 41",
    title:
      "Tìm hiểu về môi trường tu tập của người xuất gia và những sai lầm cần tránh khi chọn nơi tu tập",
    url: "#",
  },
  { day: "Ngày 42", title: "Ta là cát bụi giữa cõi trần gian?...", url: "#" },
  {
    day: "Ngày 44",
    title: "Bát quan trai giới - Lợi ích thù thắng thoát khỏi sinh tử luân hồi",
    url: "#",
  },
  {
    day: "Ngày 45",
    title: "Tại sao giữ bát quan trai giới lại được phước sinh thiên?",
    url: "#",
  },
  {
    day: "Ngày 47",
    title: "Dùng trí tuệ để diệt trừ vô minh | Làm sao để khai mở trí tuệ?",
    url: "#",
  },
  {
    day: "Ngày 48",
    title: "Câu chuyện chú tiểu và cô gái lái đò và bài học đằng sau",
    url: "#",
  },
];

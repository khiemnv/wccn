import dayjs from "dayjs";
import {
  getLunarDate,
  getYearCanChi,
  getYearInfo,
  jdn2date,
} from "../utils/amlich-hnd";
import { useState, type ReactNode, type ChangeEvent } from "react";
import { Box, IconButton, MenuItem, Select, Typography, styled, useTheme } from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";


// Chặn prop isMobile khỏi DOM
const CompactSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})<{
  isMobile?: boolean;
}>(({ theme, isMobile }) => ({
  // Kích thước tổng thể
  // fontSize: isMobile ? 13 : 14,
  // height: isMobile ? 36 : 40,

  // Vùng hiển thị giá trị đã chọn
  "& .MuiSelect-select": {
    paddingTop: theme.spacing(isMobile ? 0.5 : 0.75),
    paddingBottom: theme.spacing(isMobile ? 0.5 : 0.75),
    paddingLeft: theme.spacing(isMobile ? 1 : 1.5),
    paddingRight: theme.spacing(isMobile ? 3.5 : 4), // chừa chỗ cho icon
    minHeight: "unset",
  },

  // Viền
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[400],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[500],
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },

  // Icon dropdown
  "& .MuiSvgIcon-root": {
    fontSize: isMobile ? 18 : 20,
    right: 8,
  },
}));


/**
 * get start date of lunar month
 * @param {dayjs} today
 * @returns [startOfM: dayjs, endOfM: dayjs]
 */

type LunarDate = ReturnType<typeof getLunarDate>;

type SelectEvent = ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } });

type LularDatePickerProps = {
  setMonth: (value: dayjs.Dayjs) => void;
  month: dayjs.Dayjs;
};

export function LularDatePicker({ setMonth, month }: LularDatePickerProps) {
  const [ngayAL, setNgayAL] = useState<LunarDate>(
    getLunarDate(month.date(), month.month() + 1, month.year())
  );
  return LularDatePicker2(ngayAL, (nextNgayAL) => {
    setNgayAL(nextNgayAL);
    const arr = jdn2date(nextNgayAL.jd);
    const newMonth = dayjs(arr.reverse().join("-"));
    setMonth(newMonth);
  });
}
/**
 *
 * @param {string} ngayDL YYYY-MM-DD
 * @param {callback} setNgayDL (value: YYYY-MM-DD)
 * @returns
 */
type LularDayPickerProps = {
  ngayDL: string;
  setNgayDL: (value: string) => void;
  gio?: string;
  setGio?: (value: string) => void;
  isMobile?: boolean;
};

export function LularDayPicker({ ngayDL, setNgayDL, gio, setGio, isMobile }: LularDayPickerProps) {
  const ngay = dayjs(ngayDL);
  const ngayAL = getLunarDate(ngay.date(), ngay.month() + 1, ngay.year());
  return LularDayPicker2(
    ngayAL,
    (nextNgayAL) => {
      const arr = jdn2date(nextNgayAL.jd);
      const newDay = dayjs(arr.reverse().join("-"));
      setNgayDL(newDay.format("YYYY-MM-DD"));
    },
    gio,
    setGio,
    isMobile
  );
}

export function LularDatePicker2(
  ngayAL: LunarDate,
  setNgayAL: (value: LunarDate) => void,
  _gio?: string,
  _setGio?: (value: string) => void,
  isMobile?: boolean
) {
  const ly = getYearInfo(ngayAL.year);
  const rowGap = isMobile ? 1 : 2;
  const lst = ly.map((ld, idx) => [idx, ld.month + (ld.leap ? "+" : "")]);
  const curYear = ngayAL.year;

  const curMonthIdx = ly.findIndex(
    (d) => d.month === ngayAL.month && d.leap === ngayAL.leap
  );

  function handleChangeLM(newIdx: number) {
    let ld;
    if (newIdx < 0) {
      const prevy = getYearInfo(curYear - 1);
      ld = prevy[prevy.length - 1];
    } else if (newIdx >= ly.length) {
      const nexty = getYearInfo(curYear + 1);
      ld = nexty[0];
    } else {
      ld = ly[newIdx];
    }
    setNgayAL(ld);
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton onClick={() => handleChangeLM(curMonthIdx - 1)}>
        <ArrowBackIosIcon />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1, sm: rowGap },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>{"Tháng"}</Typography>
        <Select
          value={String(curMonthIdx)}
          onChange={(e: SelectEvent) => handleChangeLM(Number(e.target.value as string))}
        >
          {lst.map(([idx, text]) => (
            <MenuItem key={idx} value={String(idx)}>
              {text}
            </MenuItem>
          ))}
        </Select>
        <Typography>{getYearCanChi(ngayAL.year)}</Typography>
      </Box>
      <IconButton onClick={() => handleChangeLM(curMonthIdx + 1)}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}

export function LularDayPicker2(
  ngayAL: LunarDate,
  setNgayAL: (value: LunarDate) => void,
  _gio?: string,
  _setGio?: (value: string) => void,
  isMobile?: boolean
) {
  console.log("LularDayPicker2");

  const t_ly = getYearInfo(ngayAL.year);
  const t_mLst = t_ly.map((ld, idx) => [idx, ld.month + (ld.leap ? "+" : "")]);
  const t_curMonthIdx = t_ly.findIndex(
    (d) => d.month === ngayAL.month && d.leap === ngayAL.leap
  );
  let nDayOfM: number;
  if (t_curMonthIdx === t_ly.length - 1) {
    const nextYear = getYearInfo(ngayAL.year + 1);
    nDayOfM = nextYear[0].jd - t_ly[t_curMonthIdx].jd;
  } else {
    nDayOfM = t_ly[t_curMonthIdx + 1].jd - t_ly[t_curMonthIdx].jd;
  }
  const curYear = ngayAL.year;
  const curMonth = ngayAL.month;
  function handleChangeLY(yyyy: number) {
    let ld;
    const y = getYearInfo(yyyy);
    if (curMonth >= y.length) {
      ld = y[y.length - 1];
    } else {
      ld = y[curMonth - 1];
    }
    setNgayAL(ld);
  }
  function handleChangeLM(newIdx: number) {
    let ld;
    if (newIdx < 0) {
      const prevy = getYearInfo(curYear - 1);
      ld = prevy[prevy.length - 1];
    } else if (newIdx >= t_ly.length) {
      const nexty = getYearInfo(curYear + 1);
      ld = nexty[0];
    } else {
      ld = t_ly[newIdx];
    }
    setNgayAL(ld);
  }
  function handleChangeLD(day: number) {
    const newDay = { ...ngayAL, day, jd: ngayAL.jd + day - ngayAL.day };
    setNgayAL(newDay);
  }
  function onPrev() {
    // handleChangeLM(t_curMonthIdx - 1, t_curMonthIdx)
    handleChangeLY(curYear - 1)
  }
  function onNext() {
    // handleChangeLM(t_curMonthIdx + 1, t_curMonthIdx)
    handleChangeLY(curYear + 1)
  }
  return (
    <FieldsetFrame
      label="Ngày âm lịch"
      dense={Boolean(isMobile)}
      sx={{
        // responsive khoảng cách ngoài khung (tuỳ ý)
        // mt: { xs: 1, sm: 1.5 },
        // nếu muốn fullWidth ở mobile
        // width: { xs: "100%", sm: "auto" },
      }}
    >
      <Box sx={{ display: "flex", gap: 1, flexDirection: "row", alignItems: "center" }}>
        <IconButton onClick={onPrev}>
          <ArrowBackIosIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <Typography>{"Ngày"}</Typography> */}
          <CompactSelect
            value={String(ngayAL.day)}
            onChange={(e: SelectEvent) => handleChangeLD(Number(e.target.value as string))}
            isMobile={Boolean(isMobile)}
          >
            {Array.from({ length: nDayOfM }, (_, k) => (
              <MenuItem key={k + 1} value={String(k + 1)}>
                {k + 1}
              </MenuItem>
            ))}
          </CompactSelect>
          <Typography>{"/"}</Typography>
          <CompactSelect
            value={String(t_curMonthIdx)}
            onChange={(e: SelectEvent) => handleChangeLM(Number(e.target.value as string))}
            isMobile={Boolean(isMobile)}
          >
            {t_mLst.map(([idx, text]) => (
              <MenuItem key={idx} value={String(idx)}>
                {text}
              </MenuItem>
            ))}
          </CompactSelect>
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimeField
          sx={{ width: "110px" }}
          format="HH:mm:ss"
          value={dayjs("1900-01-01 " + (gio || "00:00:00"))}
          onChange={(newValue) => setGio(newValue.format("hh:mm:ss"))}
        ></TimeField>
      </LocalizationProvider> */}
          <Typography>{getYearCanChi(ngayAL.year)}</Typography>
        </Box>
        <IconButton
          onClick={onNext}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </FieldsetFrame>
  );
}

/**
 * Frame có label nổi trên viền giống MUI Outlined input
 * Props:
 *  - label: string
 *  - children: ReactNode
 *  - sx: MUI System sx override
 *  - dense: boolean (thu gọn padding/label size)
 *  - disabled: boolean (nhạt màu như control disabled)
 */
type FieldsetFrameProps = {
  label: string;
  children: ReactNode;
  sx?: Record<string, unknown>;
  dense?: boolean;
  disabled?: boolean;
};

export function FieldsetFrame({
  label,
  children,
  sx,
  dense = false,
  disabled = false,
}: FieldsetFrameProps) {
  const theme = useTheme();

  // Màu sắc theo disabled/normal
  const borderColor = disabled
    ? theme.palette.action.disabled
    : theme.palette.divider;
  const labelColor = disabled
    ? theme.palette.text.disabled
    : theme.palette.text.secondary;

  return (
    <Box
      component="fieldset"
      sx={{
        position: "relative",
        m: 0,
        p: dense ? 0.5 : 0.75,
        pt: dense ? 1.25 : 1.5, // chừa chỗ cho legend
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        // để legend “nằm” trên viền mượt
        "& legend": {
          // reset mặc định
          width: "auto",
          height: "auto",
          p: 0,
          m: 0,
          // layout
          position: "absolute",
          top: 0,
          left: dense ? 10 : 12, // tương tự notch của Outlined
          transform: "translateY(-50%)",
          // kiểu chữ giống InputLabel shrink
          fontSize: { xs: dense ? 11 : 12, sm: dense ? 12 : 13 },
          lineHeight: 1,
          color: labelColor,
          // nền che viền bên dưới legend
          px: 0.5,
          backgroundColor: (t) => t.palette.background.paper,
          // bo góc nhẹ cho cảm giác giống notch
          borderRadius: 0.5,
        },
        ...sx,
      }}
    >
      <Box component="legend">{label}</Box>
      {children}
    </Box>
  );
}

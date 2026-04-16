import dayjs from "dayjs";
import {
  getLunarDate,
  getYearCanChi,
  getYearInfo,
  jdn2date,
} from "../utils/amlich-hnd";
import { useState } from "react";
import { Box, FormLabel, IconButton, Menu, MenuItem, Paper, Select, Stack, Typography, styled, useTheme } from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { lightBlue } from "@mui/material/colors";

// Chặn prop isMobile khỏi DOM
const CompactSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})(({ theme, isMobile }) => ({
  // Kích thước tổng thể
  // fontSize: isMobile ? 13 : 14,
  // height: isMobile ? 36 : 40,

  // Vùng hiển thị giá trị đã chọn
  "& .MuiSelect-select": {
    paddingTop: theme.spacing(isMobile ? 0.25 : 0.5),
    paddingBottom: theme.spacing(isMobile ? 0.25 : 0.5),
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

export function getLunarMonthStartEnd(today = dayjs()) {
  const ngayAL = getLunarDate(today.date(), today.month() + 1, today.year());
  const startOfM = today.subtract(ngayAL.day - 1, "d");
  const day2 = startOfM.add(30, "d");
  const ngayAl2 = getLunarDate(day2.date(), day2.month() + 1, day2.year());
  const endOfM = day2.subtract(ngayAl2.day, "d");
  return [startOfM, endOfM];
}
export function getLunarMonthStartEnd2(ngayAL) {
  var y = getYearInfo(ngayAL.year);
  var monthIdx = y.findIndex(
    (m) => m.month === ngayAL.month && m.leap === ngayAL.leap
  );
  var nDays;
  var startAl = y[monthIdx];
  if (monthIdx === y.length - 1) {
    var nexty = getYearInfo(ngayAL.year + 1);
    nDays = nexty[0].jd - y[monthIdx].jd;
  } else {
    nDays = y[monthIdx + 1].jd - y[monthIdx].jd;
  }
  var endAL = { ...startAl, day: nDays, jd: startAl.jd + nDays - 1 };
  return [startAl, endAL];
}
export function LularDatePicker({ setMonth, month }) {
  const [ngayAL, setNgayAL] = useState(
    getLunarDate(month.date(), month.month() + 1, month.year())
  );
  return LularDatePicker2(ngayAL, (ngayAL) => {
    setNgayAL(ngayAL);
    var arr = jdn2date(ngayAL.jd);
    var newMoth = dayjs(arr.reverse().join("-"));
    setMonth(newMoth);
  });
}
/**
 *
 * @param {string} ngayDL YYYY-MM-DD
 * @param {callback} setNgayDL (value: YYYY-MM-DD)
 * @returns
 */
export function LularDayPicker({ ngayDL, setNgayDL, gio, setGio, isMobile }) {
  var ngay = dayjs(ngayDL);
  var ngayAL = getLunarDate(ngay.date(), ngay.month() + 1, ngay.year());
  return LularDayPicker2(
    ngayAL,
    (ngayAL) => {
      var arr = jdn2date(ngayAL.jd);
      var newDay = dayjs(arr.reverse().join("-"));
      setNgayDL(newDay.format("YYYY-MM-DD"));
    },
    gio,
    setGio, 
    isMobile
  );
}

export function LularDatePicker2(ngayAL, setNgayAL, gio, setGio, isMobile) {
  const ly = getYearInfo(ngayAL.year);
  const lst = ly.map((ld, idx) => [idx, ld.month + (ld.leap ? "+" : "")]);
  const curYear = ngayAL.year;

  const curMonthIdx = ly.findIndex(
    (d) => d.month === ngayAL.month && d.leap === ngayAL.leap
  );

  function handleChangeLM(newIdx) {
    var ld;
    if (newIdx < 0) {
      var prevy = getYearInfo(curYear - 1);
      ld = prevy[prevy.length - 1];
    } else if (newIdx >= ly.length) {
      var nexty = getYearInfo(curYear + 1);
      ld = nexty[0];
    } else {
      ld = ly[newIdx];
    }
    setNgayAL(ld);
  }
  return (
    <div style={{ display: "flex" }}>
      <IconButton onClick={() => handleChangeLM(curMonthIdx - 1)}>
        <ArrowBackIosIcon />
      </IconButton>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction={"row"}
        alignItems="center"
        justifyContent="center"
      >
        <Typography>{"Tháng"}</Typography>
        <Select
          value={curMonthIdx}
          onChange={(e) => handleChangeLM(e.target.value)}
        >
          {lst.map(([idx, text]) => (
            <MenuItem key={idx} value={idx}>
              {text}
            </MenuItem>
          ))}
        </Select>
        <Typography>{getYearCanChi(ngayAL.year)}</Typography>
      </Stack>
      <IconButton onClick={() => handleChangeLM(curMonthIdx + 1)}>
        <ArrowForwardIosIcon />
      </IconButton>
    </div>
  );
}

export function LularDayPicker2(ngayAL, setNgayAL, gio, setGio, isMobile) {
  console.log("LularDayPicker2");

  const t_ly = getYearInfo(ngayAL.year);
  const t_mLst = t_ly.map((ld, idx) => [idx, ld.month + (ld.leap ? "+" : "")]);
  const t_curMonthIdx = t_ly.findIndex(
    (d) => d.month === ngayAL.month && d.leap === ngayAL.leap,
  );
  var nDayOfM;
  if (t_curMonthIdx === t_ly.length - 1) {
    var nextYear = getYearInfo(ngayAL.year + 1);
    nDayOfM = nextYear[0].jd - t_ly[t_curMonthIdx].jd;
  } else {
    nDayOfM = t_ly[t_curMonthIdx + 1].jd - t_ly[t_curMonthIdx].jd;
  }
  const curYear = ngayAL.year;
  const curMonth = ngayAL.month;
  const curDay = ngayAL.day;
  function handleChangeLY(yyyy) {
    var ld;
    var y = getYearInfo(yyyy);
    console.log(y)
    if (curMonth >= y.length) {
      ld = y[y.length - 1];
    } else {
      ld = y[curMonth - 1];
    }
    setNgayAL(ld);
  }
  function handleChangeLM(newIdx) {
    var ld;
    if (newIdx < 0) {
      var prevy = getYearInfo(curYear - 1);
      ld = prevy[prevy.length - 1];
    } else if (newIdx >= t_ly.length) {
      var nexty = getYearInfo(curYear + 1);
      ld = nexty[0];
    } else {
      ld = t_ly[newIdx];
    }
    setNgayAL(ld);
  }
  function handleChangeLD(day) {
    var newDay = { ...ngayAL, day: day, jd: ngayAL.jd + day - ngayAL.day };
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
      dense={true} // mobile: thu gọn padding/label
      sx={
        {
          minWidth: "fit-content"
          // responsive khoảng cách ngoài khung (tuỳ ý)
          // mt: { xs: 1, sm: 1.5 },
          // nếu muốn fullWidth ở mobile
          // width: { xs: "100%", sm: "auto" },
        }
      }
    >
      <Stack spacing={1} direction={"row"}>
        <Stack
          spacing={1}
          direction={"row"}
          alignItems="center"
          justifyContent="center"
        >
          {/* <Typography>{"Ngày"}</Typography> */}
          <HybridSelectNumberField
            value={ngayAL.day}
            onChange={(e) => handleChangeLD(e)}
            size={true?"small":"medium"}
            options={Array.from({ length: nDayOfM }, (v, k) =>({label: k+1, value: k+1}))}
          ></HybridSelectNumberField>
          {/* <CompactSelect
            value={ngayAL.day}
            onChange={(e) => handleChangeLD(e.target.value)}
            size={isMobile?"small":"medium"}
            isMobile={true}
          >
            {Array.from({ length: nDayOfM }, (v, k) => (
              <MenuItem key={k + 1} value={k + 1}>
                {k + 1}
              </MenuItem>
            ))}
          </CompactSelect> */}
          {/* <Typography>{"/"}</Typography> */}
          <HybridSelectNumberField
            value={t_curMonthIdx}
            onChange={(val) => handleChangeLM(val, t_curMonthIdx)}
            size={true?"small":"medium"}
            options={t_mLst.map(([idx, text])=>({label:text, value:idx}))}
          />
          {/* <CompactSelect
            value={t_curMonthIdx}
            onChange={(e) => handleChangeLM(e.target.value, t_curMonthIdx)}
            size={isMobile?"small":"medium"}
            isMobile={true}
          >
            {t_mLst.map(([idx, text]) => (
              <MenuItem key={idx} value={idx}>
                {text}
              </MenuItem>
            ))}
          </CompactSelect> */}
          {/* <Typography>{"/"}</Typography> */}
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimeField
          sx={{ width: "110px" }}
          format="HH:mm:ss"
          value={dayjs("1900-01-01 " + (gio || "00:00:00"))}
          onChange={(newValue) => setGio(newValue.format("hh:mm:ss"))}
        ></TimeField>
      </LocalizationProvider> */}
        </Stack>
        <NumberField
          value={`${ngayAL.year} (${getYearCanChi(ngayAL.year)})`}
          onIncrease={onNext}
          onDecrease={onPrev}
          size={true?"small":"large"} // hoặc "large"
        />
       
      </Stack>
    </FieldsetFrame>
  );
}

const NumberField = ({ value, onIncrease, onDecrease, size = "small" }) => {
  const isSmall = size === "small";

  const height = isSmall ? 32 : 48;
  const fontSize = isSmall ? 14 : 18;
  const buttonHeight = height / 2;

  return (
    <Box
      sx={{
        display: "flex",
        // border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        height,
        background: lightBlue[50]
      }}
    >
      {/* value */}
      <Box
        sx={{
          px: isSmall ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          // minWidth: isSmall ? 60 : 80,
          // fontSize,
        }}
      >
        {value}
      </Box>

      {/* buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          size="small"
          sx={{ p: 0, height: buttonHeight }}
          onClick={onIncrease}
        >
          <ArrowDropUpIcon fontSize={isSmall ? "small" : "medium"} />
        </IconButton>

        <IconButton
          size="small"
          sx={{ p: 0, height: buttonHeight }}
          onClick={onDecrease}
        >
          <ArrowDropDownIcon fontSize={isSmall ? "small" : "medium"} />
        </IconButton>
      </Box>
    </Box>
  );
};

const HybridSelectNumberField = ({
  options = [],
  value,
  onChange,
  size = "small",
}) => {
  const isSmall = size === "small";

  const height = isSmall ? 32 : 44;
  const fontSize = isSmall ? 14 : 18;
  const buttonHeight = height / 2;

  const currentIndex = options.findIndex((o) => o.value === value);
  const currentLabel = options[currentIndex]?.label ?? "";

  const [anchorEl, setAnchorEl] = useState(null);

  const handleNext = () => {
    if (currentIndex < options.length - 1) {
      onChange(options[currentIndex + 1].value);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onChange(options[currentIndex - 1].value);
    }
  };

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          // border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          height,
          cursor: "pointer",          
          background: lightBlue[50]
        }}
      >
        {/* value (click mở dropdown) */}
        <Box
          onClick={handleOpen}
          sx={{
            px: isSmall ? 1 : 1.5,
            display: "flex",
            alignItems: "center",
            // minWidth: isSmall ? 80 : 100,
            // fontSize,
            flex: 1,
          }}
        >
          {currentLabel}
        </Box>

        {/* buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton
            size="small"
            sx={{ p: 0, height: buttonHeight }}
            onClick={handleNext}
            disabled={currentIndex === options.length - 1}
          >
            <ArrowDropUpIcon fontSize={isSmall ? "small" : "medium"} />
          </IconButton>

          <IconButton
            size="small"
            sx={{ p: 0, height: buttonHeight }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowDropDownIcon fontSize={isSmall ? "small" : "medium"} />
          </IconButton>
        </Box>
      </Box>

      {/* dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === value}
            onClick={() => {
              onChange(opt.value);
              handleClose();
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
/**
 * Frame có label nổi trên viền giống MUI Outlined input
 * Props:
 *  - label: string
 *  - children: ReactNode
 *  - sx: MUI System sx override
 *  - dense: boolean (thu gọn padding/label size)
 *  - disabled: boolean (nhạt màu như control disabled)
 */
export function FieldsetFrame({
  label,
  children,
  sx,
  dense = false,
  disabled = false,
}) {
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
        pt: dense ? 1 : 1.25, // chừa chỗ cho legend
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
          top: "-3px",
          left: dense ? 10 : 12, // tương tự notch của Outlined
          transform: "translateY(-50%)",
          // kiểu chữ giống InputLabel shrink
          fontSize: "small",
          // fontSize: { xs: dense ? 11 : 12, sm: dense ? 12 : 13 },
          lineHeight: 1,
          color: labelColor,
          // nền che viền bên dưới legend
          px: "4px",
          backgroundColor: (t) => t.palette.background.paper,
          // bo góc nhẹ cho cảm giác giống notch
          borderRadius: 0.5,
        },
        '&:hover': {
          borderColor: 'black',
        },
        ...sx,
      }}
    >
      <Box component="legend">{label}</Box>
      {children}
    </Box>
  );
}

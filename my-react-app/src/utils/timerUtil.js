import moment from "moment/moment";

export const timeFormater = (val) => {
  try {
    var m = Math.fround(val * 24 * 60);
    var h = Math.floor(m / 60);
    return `${h}`.padStart(2,'0') + ':' + `${m%60}`.padStart(2,'0');
  } catch (ex) {
    console.log(ex.message);
    return '00:00';
  }
};
export const timeParser = (val) => {
  try {
    var arr = val.split(":").map((d) => parseInt(d));
    return (arr[1] / 60 + arr[0]) / 24;
  } catch (ex) {
    console.log(ex.message);
    return val;
  }
};

/**
 * convert excel date to string
 * @param {number} excel date
 * @return {string}  YYYY-MM-DD
 */
export const dateFormater = (val) => {
  var excelDate = 43101.622083333335;
  var unixTimestamp = (excelDate-25569)*86400 //as per the post above, convert Excel date to unix timestamp, assuming Mac/Windows Excel 2011 onwards
  var date = moment(new Date(unixTimestamp)); //Pass in unix timestamp instead of Excel date
  return date.format('YYYY-MM-DD');
}
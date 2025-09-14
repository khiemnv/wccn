import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

export function refineSheet(jsonData) {
  const rawHdr = jsonData[0];
  var idx = rawHdr.indexOf("");
  var adjData = jsonData.map((row) => row.slice(0, idx));
  var hdr = adjData.shift();
  var sheetHdr = hdr.map((name) => ({
    name: name,
    type: name.includes("時間指定")
      ? "time"
      : name.includes("年月日")
      ? "date"
      : undefined,
  }));
  return { sheetHdr, sheetData: adjData };
}

export function convertToVehicles(sh) {
  const A = 0;
  const B = 1;
  const C = 2;
  const D = 3;
  const E = 4;
  const L = 11;
  var { sheetData, sheetHdr } = refineSheet(sh);
  var vehicles = sheetData.map((row) => {
    var v = {};
    v.VehicleCode = row[A];
    v.VehicleName = row[B];
    v.VehicleCapacity = row[C];
    v.ActiveTime = {
      StartTime: row[D] * 24 * 60,
      EndTime: row[E] * 24 * 60,
    };
    v.VehicleType =
      row[L] === "8ｔ車"
        ? 0
        : row[L] === "12ｔ車"
        ? 1
        : row[L] === "15ｔ車"
        ? 2
        : 3;
    v.isUsed = row[A].match(/001777|002771/) ? false : true;
    return v;
  });
  return vehicles;
}
export function convertToOrders(hdr, data) {
    const A = 0;
    const B = 1;
    const C = 2;
    const D = 3;
    const E = 4;
    const F = 5;
    const G = 6;
    const H = 7;
    const I = 8;
    const J = 9;
    const K = 10;
    const L = 11;
    const M = 12;
    const N = 13;
    const O = 14;
    const P = 15;
    const Q = 16;
    const R = 17;
    const S = 18;
    const T = 19;
    const U = 20;
    const V = 21;
    const AA = 26;
    const AB = 27;
    
    
    var orders = data.map((row) => {
      var o = {};
      o.Type = row[B] === "出荷" ? 0 : row[B] === "引取" ? 2 : 1;
      o.pickup = {
        Code: row[C],
        Name: row[D],
        Address: row[E],
        AreaGroup: 0
      };
      o.delivery = {
        Code: row[F],
        Name: row[G],
        Address: row[H],
        AreaGroup: 0
      };
      o.VehicleAvailable = row[K] === "8tまで"?
      0:row[K] === "12tまで"?1:row[K] === "15tまで"?2:3;
      o.Code = row[I];
      o.product = {
        SteelCode:row[L],
        SteelType:row[M],
        SteelDimension: {
            Dim1:row[O]|0,
            Dim2:row[P]|0,
            Dim3:row[Q]|0,
            Dim4:row[R]|0,
          },
        Quantity: row[S]|0,
        Weight: row[T]|0,
      };
      o.delivery_time = {
        Earliest:row[AA]*24*60,
        Latest:row[AB]*24*60
      }
      return o;
    });
    return orders;
}
function convertWbToBlob(wb) {
  var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
  var wbout = XLSX.write(wb, wopts);
  let blob = new Blob([wbout], { type: "application/octet-stream" });
  return blob;
}

export function convertJsonToFile(json) {
  let blob = new Blob([JSON.stringify(json)], { type: "plain/text" });
  var planId = newId();
  var fileName = `plan_${planId}.json`;
  let file = new File([blob], fileName);
  return { file, fileName, planId };
}

export function convertWbToFile(wb) {
  let blob = convertWbToBlob(wb);
  var rawId = newId();
  var fileName = `raw_${rawId}.xlsx`;
  let file = new File([blob], fileName);
  return { file, fileName, rawId };
}

function newId() {
  return uuidv4().replace(/-/g, "");
}

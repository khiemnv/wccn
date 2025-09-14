import { newDefaultGroup } from "../services/group/groupApi";
import { newDefaultUser } from "../services/user/userApi";

export function idFromMongo(raw) {
  return raw ? raw["$oid"] : "";
}
export function dateFromMongo(raw) {
  return raw
    ? new Date(parseInt(raw["$date"]["$numberLong"])).toISOString()
    : "";
}

export function userFromMongo(raw) {
  const user = newDefaultUser();
  Object.keys(user).forEach((key) => {
    if (!raw.hasOwnProperty(key)) {
      return;
    }

    switch (key) {
      case "_id":
      case "daoTrang":
        user[key] = idFromMongo(raw[key]);
        break;
      case "birth":
      case "ngayLenChinhThuc":
      case "ngayLenDuThinh":
      case "ngayVaoDaoTrang":
      case "ngayLenGieoDuyen":
      case "ngayLenTuyHy":
        user[key] = dateFromMongo(raw[key]);
        break;
      default:
        user[key] = raw[key];
        break;
    }
  });

  return user;
}

export function groupFromMongo(raw) {
  const group = newDefaultGroup();
  Object.keys(group).forEach((key) => {
    if (!raw.hasOwnProperty(key)) {
      return;
    }

    switch (key) {
      case "_id":
      case "daoTrang":
        group[key] = idFromMongo(raw[key]);
        break;
      case "name":
      case "leader":
      case "subLeader":
      case "members":
      case "beginner":
      default:
        group[key] = raw[key];
        break;
    }
  });

  return group;
}

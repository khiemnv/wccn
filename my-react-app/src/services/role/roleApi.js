import { where } from "firebase/firestore";
import { BaseApi } from "../user/userApi";
/**
 * CURD
 */

class RoleApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      btc: "",
      tp: "",
    };
    super("roles", defaultEntity);
  }
}
var roleApi = new RoleApi()

export const getRole = (gmail, token) => roleApi.getOne(gmail, token);
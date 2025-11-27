import { where } from "firebase/firestore";
import { BaseApi } from "../user/userApi";
/**
 * CURD
 */

class RoleApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      keys: "",
      titles: "",
      titles_log: "",
      bbh_keys: "",
      bbh_titles: "",
      bbh_titles_log: "",
    };
    super("roles", defaultEntity);
  }
}
var roleApi = new RoleApi()

export const getRole = (gmail, token) => roleApi.getOne(gmail);
export const getAllRoles = () => roleApi.getAll();
export const createRole = (role, token) => roleApi.create(role);
export const updateRole = (id, changes, token) => roleApi.update(id, changes);
export const saveRole = (role, token) => roleApi.save(role);
export const removeRole = (id, token) => roleApi.remove(id);
export const saveOrCreateRole = (role, token) => roleApi.saveOrCreate(role);

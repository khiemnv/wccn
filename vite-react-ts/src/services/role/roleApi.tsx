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
      tags: "",
      tags_log: "",
    };
    super("roles", defaultEntity);
  }
}
const roleApi = new RoleApi();

export const getRole = (gmail: string, token?: string) => {
  void token;
  return roleApi.getOne(gmail);
};
export const getAllRoles = () => roleApi.getAll();
export const createRole = (
  role: Record<string, unknown>,
  token?: string
) => {
  void token;
  return roleApi.create(role);
};
export const updateRole = (
  id: string,
  changes: Record<string, unknown>,
  token?: string
) => {
  void token;
  return roleApi.update(id, changes);
};
export const saveRole = (
  role: Record<string, unknown>,
  token?: string
) => {
  void token;
  return roleApi.save(role);
};
export const removeRole = (id: string, token?: string) => {
  void token;
  return roleApi.remove(id);
};
export const saveOrCreateRole = (
  role: Record<string, unknown>,
  token?: string
) => {
  void token;
  return roleApi.saveOrCreate(role);
};

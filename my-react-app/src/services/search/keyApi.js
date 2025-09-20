import { where } from "firebase/firestore";
import { BaseApi } from "../user/userApi";
/**
 * CURD
 */

class KeyApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      titles: "",
      word: "",
      keyId: 0,
    };
    super("keys", defaultEntity);
  }
}
var keyApi = new KeyApi()
const originalKeyGet = keyApi.getOne;

function keyWrapMethod(originalMethod, idx) {
  return async function() {
    // Call the original method
    var { error, result } = await originalMethod.apply(this, arguments);
    if (!error) {
      if (Array.isArray(result)) {
        result.forEach(function(key) {
          key.keyId = parseInt(key.keyId);
          key.titles = JSON.parse(key.titles);
          key.titles.forEach(t=>{
            t.titleId = parseInt(t.titleId);
          });
        });
      } else {
        result.keyId = parseInt(result.keyId);
        result.titles = JSON.parse(result.titles);
        result.titles.forEach(t=>{
          t.titleId = parseInt(t.titleId);
        });
      }
    }
    return { error, result };
  }
}
keyApi.getOne = keyWrapMethod(originalKeyGet, 0);
export const getKey = (id) => keyApi.getOne(id);

class TitleApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      titles: "",
      word: "",
      keyId: 0,
    };
    super("titles", defaultEntity);
  }
}
var titleApi = new TitleApi()
const originalTitleGet = titleApi.getOne;

function titleWrapMethod(originalMethod, idx) {
  return async function() {
    // Call the original method
    var { error, result } = await originalMethod.apply(this, arguments);
    if (!error) {
      if (Array.isArray(result)) {
        result.forEach(function(title) {
          title.titleId = parseInt(title.titleId);
        });
      } else {
        result.titleId = parseInt(result.titleId);
      }
    }
    return { error, result };
  }
}
titleApi.getOne = titleWrapMethod(originalTitleGet, 0);
export const getTitle = (id) => titleApi.getOne(id);
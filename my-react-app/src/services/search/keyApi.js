import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  addDoc,
  getDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BaseApi } from "../user/userApi";
/**
 * CURD
 */

class KeyApi extends BaseApi {
  async getKey(keyId, mode) {
    try {
      // fetch {id: number, key: string}

      // const ref = doc(db, this.collectionName, keyId.toString());
      // const docSnap = await getDoc(ref);
      // if (docSnap.exists()) {
      //   var obj = { ...docSnap.data(), id: docSnap.id };
      //   // this.map.set(obj.id, cloneObj(obj));
      //   keyObj.word = obj.key;
      // } else {
      //   return { error: "not found" };
      // }

      // fetch titles: T<tid>P<pid>,<pos>...T<tid>P<pid>,<pos>...
      const map = new Map();
      const querySnapshot = await getDocs(collection(db, mode === "QA" ? `keys/${keyId}/t` : `bbh_keys/${keyId}/t`));
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        var grp = doc.data();
        var tlst = grp.data.split("T");
        tlst.shift();
        tlst.forEach((t) => {
          var tObj = { paras: [] };
          var plst = t.split("P");
          var p1st = plst.shift();
          tObj.titleId = parseInt(p1st);
          plst.forEach((p) => {
            var arr = p.split(",").map((x) => parseInt(x));
            var paraId = arr.shift();
            tObj.paras.push({ paraId, pos: arr });
          });
          map.set(tObj.titleId, tObj);
        });
      });

      // create key object
      var keyObj = { keyId: parseInt(keyId), titles: Array.from(map.values()) };

      // update cache
      // this.map.clear();
      // result.forEach((u) => this.map.set(u.id, cloneObj(u)));
      // console.log("fetched key ", keyId, keyObj);
      return { result: keyObj };
    } catch (ex) {
      return { error: ex.message };
    }
  }
}
var keyApi = new KeyApi();
export const getKey = (id, mode = "QA") => keyApi.getKey(id, mode);

class TitleApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      paragraphs: [],
      path: "",
      title: "",
      titleId: 0,
    };
    super("titles", defaultEntity);
  }
}
var titleApi = new TitleApi();
const originalTitleGet = titleApi.getOne;

function titleWrapMethod(originalMethod, idx) {
  return async function () {
    // Call the original method
    var { error, result } = await originalMethod.apply(this, arguments);
    if (!error) {
      if (Array.isArray(result)) {
        result.forEach(function (title) {
          title.titleId = parseInt(title.titleId);
        });
      } else {
        result.titleId = parseInt(result.titleId);
      }
    }
    return { error, result };
  };
}
titleApi.getOne = titleWrapMethod(originalTitleGet, 0);

class TitleApi2 extends BaseApi {
  constructor() {
    const defaultEntity = {
      paragraphs: [],
      path: "",
      title: "",
      titleId: 0,
    };
    super("bbh_titles", defaultEntity);
  }
}
var titleApi2 = new TitleApi2();
titleApi2.getOne = titleWrapMethod(titleApi2.getOne, 0);

export const updateTitle = (id, changes, mode = "QA") => mode === "QA" ? titleApi.update(id, changes) : titleApi2.update(id, changes);
export const getTitle = (id, mode = "QA") => mode === "QA" ? titleApi.getOne(id) : titleApi2.getOne(id);

class TagApi extends BaseApi {
  constructor() {
    const defaultEntity = { tag: "" };
    super("tags", defaultEntity);
  } 
}
var tagApi = new TagApi();
export const getAllTags = () => tagApi.getAll();
export const createTag = (tag, token) => tagApi.create(tag);
export const updateTag = (id, changes, token) => tagApi.update(id, changes);
export const saveTag = (tag, token) => tagApi.save(tag);  
export const removeTag = (id, token) => tagApi.remove(id);
export const saveOrCreateTag = (tag, token) => tagApi.saveOrCreate(tag);

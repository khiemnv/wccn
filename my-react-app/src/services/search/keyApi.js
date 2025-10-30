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
  constructor() {
    const defaultEntity = {
      titles: "",
      word: "",
      keyId: 0,
    };
    super("keys", defaultEntity);
  }

  async getKey(keyId) {
    try {
      // initialize key object
      var keyObj = {keyId: parseInt(keyId), titles: []};

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
      const querySnapshot = await getDocs(collection(db, `keys/${keyId}/t`));
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        var grp = doc.data();
        var tlst=grp.data.split("T");
        tlst.shift();
        tlst.forEach(t=>{
          var tObj = {paras: []};
          var plst = t.split("P");
          var p1st = plst.shift();
          tObj.titleId = parseInt(p1st);
          plst.forEach(p=>{
            var arr = p.split(",").map(x=>parseInt(x));
            var paraId = arr.shift()
            tObj.paras.push({paraId, pos: arr})
          });
          keyObj.titles.push(tObj);
        })});

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
var keyApi = new KeyApi()
const originalKeyGet = keyApi.getOne;

function keyWrapMethod(originalMethod, idx) {
  return async function() {
    try {
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
    } catch(e) {
      return {error: e, result: null};
    }
    
  }
}
keyApi.getOne = keyWrapMethod(originalKeyGet, 0);
export const getKey = (id) => keyApi.getKey(id);

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
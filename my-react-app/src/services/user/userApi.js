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
import { calcPath as calcPatch, snapshotToArray } from "../../utils/fbUtil";
import latinize from "latinize";
import { patch } from "@mui/material";

/**
 * Splits an array into chunks of a specified size.
 * @param {Array} arr
 * @param {number} size
 * @returns {Array[]}
 */
function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

/**
 * CURD
 */

export class BaseApi {
  constructor(collectionName, defaultEntity) {
    this.collectionName = collectionName;
    this.map = new Map();
    this.defaultEntity = defaultEntity;
  }

  async remove(id) {
    try {
      console.log("delete", this.collectionName, "/", id);

      // check cache
      if (!this.map.has(id)) {
        return { error: "id not in cache!" };
      }

      await deleteDoc(doc(db, this.collectionName, id));

      // update cache
      var result = this.map.get(id);
      this.map.delete(id);

      return { result };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  async removeAll(w) {
    try {
      const ref = collection(db, this.collectionName);
      const q = query(ref, w);
      const s = await getDocs(q);
      // const ids = s.docs.map((docItem) => docItem.id);
      // console.log("delete all ", this.collectionName, "/", ids);
      // const p = ids.map(async (id) => await deleteDoc(doc(db, this.collectionName, id)));
      // await Promise.all(p);
      // return {result: ids}

      const MAX_WRITES_PER_BATCH = 500; /** https://cloud.google.com/firestore/quotas#writes_and_transactions */

      /**
       * `chunk` function splits the array into chunks up to the provided length.
       * You can get it from either:
       * - [Underscore.js](https://underscorejs.org/#chunk)
       * - [lodash](https://lodash.com/docs/4.17.15#chunk)
       * - Or one of [these answers](https://stackoverflow.com/questions/8495687/split-array-into-chunks#comment84212474_8495740)
       */
      const batches = chunk(s.docs, MAX_WRITES_PER_BATCH);
      console.log(`Removing ${s.docs.length} documents in ${batches.length} batches.`);
      const commitBatchPromises = [];
      const deletedIds = [];

      batches.forEach((batchDocs) => {
        const batch = writeBatch(db);
        batchDocs.forEach((docItem) => {
          batch.delete(docItem.ref);
          deletedIds.push(docItem.id);
        });
        commitBatchPromises.push(batch.commit());
      });

      await Promise.all(commitBatchPromises);
      return { result: deletedIds };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  async update(id, changes) {
    try {
      console.log("update", this.collectionName, "/", id, changes);

      // check cache
      if (!this.map.has(id)) {
        return { error: "id not in cache!" };
      }

      const ref = doc(db, this.collectionName, id);
      await updateDoc(ref, changes);

      // update cache
      const u = this.map.get(id);
      Object.keys(changes).forEach((key) => (u[key] = changes[key]));

      // add log
      try {
        const logRef = collection(db, this.collectionName + "_log");
        const logDocRef = await addDoc(logRef, {
          action: "update",
          json: JSON.stringify(changes),
          itemId: id,
          timestamp: Timestamp.now(),
        });
        console.log("logDocRef:", logDocRef.id);
      } catch (error) {
        console.log(error.message);
      }

      return { result: cloneObj(u) };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  async update2(before, changes) {
    try {
      var id = before.id;
      console.log("update", this.collectionName, "/", id, changes);

      // check cache
      if (!this.map.has(id)) {
        return { error: "id not in cache!" };
      }

      const ref = doc(db, this.collectionName, id);
      await updateDoc(ref, changes);

      // update cache
      const u = this.map.get(id);
      Object.keys(changes).forEach((key) => (u[key] = changes[key]));

      // add log
      try {
        var after = {...before, ...changes};
        var text = calcPatch(before, after);
        const logRef = collection(db, this.collectionName + "_log");
        const logDocRef = await addDoc(logRef, {
          action: "update",
          patch: text,
          itemId: id,
          timestamp: Timestamp.now(),
        });
        console.log("logDocRef:", logDocRef.id);
      } catch (error) {
        console.log(error.message);
      }

      return { result: cloneObj(u) };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  async getLog(id) {
    try {
      const ref = collection(db, this.collectionName + "_log");
      const q = query(ref, where("itemId", "==", id));
      const querySnapshot = await getDocs(q);
      const result = snapshotToArray(querySnapshot);

      return { result };
    } catch (ex) {
      return { error: ex.message };
    }
  }
  async updateLog(logId, changes) {
  try {
    const ref = doc(db, this.collectionName + "_log", logId);
    await updateDoc(ref, changes);
    return { result: true };
  } catch (ex) {
    return { error: ex.message };
  }
}
  /**
   *
   * @param {object} entity {id, ...}
   * @returns
   */
  async saveOrCreate(entity) {
    try {
      const id = entity.id;
      if (!id) {
        return { error: "missing id!" };
      }

      if (this.map.has(id)) {
        return await this.save(entity);
      }

      // create
      const body = {};
      Object.keys(this.defaultEntity).forEach((key) => {
        body[key] = entity[key] || this.defaultEntity[key];
      });

      const ref = doc(db, this.collectionName, id);
      await setDoc(ref, body);

      // save to cache
      body.id = id;
      this.map.set(id, cloneObj(body));

      return { result: body };
    } catch (ex) {
      console.log(ex.message);
      return { error: ex.message };
    }
  }

  async save(entity) {
    try {
      const id = entity.id;
      if (!id) {
        return { error: "missing id!" };
      }

      const old = this.map.get(id);
      const changes = {};
      Object.keys(this.defaultEntity).forEach((key) => {
        if (entity[key] !== old[key]) {
          changes[key] = entity[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        return await this.update(id, changes);
      } else {
        console.log("no change");
        return { result: cloneObj(old) };
      }
    } catch (ex) {
      console.log(ex.message);
      return { error: ex.message };
    }
  }

  /**
   * entity not has property id
   * @param {} entity
   * @returns
   */
  async create({ id = null, ...entity }) {
    try {
      const body = {};
      Object.keys(this.defaultEntity).forEach((key) => {
        body[key] = entity[key] || this.defaultEntity[key];
      });

      if (id) {
        var ref = doc(db, this.collectionName, id);
        var docRef = await setDoc(ref, body);
        body.id = id;
        this.map.set(id, cloneObj(body));
      } else {
        ref = collection(db, this.collectionName);
        docRef = await addDoc(ref, body);
        console.log(docRef.id);
        // save to cache
        body.id = docRef.id;
        this.map.set(docRef.id, cloneObj(body));
      }

      // log
      try {
        const logRef = collection(db, this.collectionName + "_log");
        const logDocRef = await addDoc(logRef, {
          action: "create",
          json: JSON.stringify(body),
          itemId: body.id,
          timestamp: Timestamp.now(),
        });
        console.log("logDocRef:", logDocRef.id);
      } catch (error) {
        console.log(error.message);
      }

      return { result: body };
    } catch (ex) {
      console.log(ex.message);
      return { error: ex.message };
    }
  }

  async query(w) {
    try {
      const ref = collection(db, this.collectionName);
      const q = query(ref, w);
      const querySnapshot = await getDocs(q);
      const result = snapshotToArray(querySnapshot);

      // update cache
      // this.map.clear();
      result.forEach((u) => this.map.set(u.id, cloneObj(u)));

      return { result };
    } catch (ex) {
      return { error: ex.message };
    }
  }
  

  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const result = snapshotToArray(querySnapshot);

      // update cache
      this.map.clear();
      result.forEach((u) => this.map.set(u.id, cloneObj(u)));

      return { result };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  async getOne(id) {
    const ref = doc(db, this.collectionName, id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      var obj = { ...docSnap.data(), id: docSnap.id };
      this.map.set(obj.id, cloneObj(obj));
      return { result: obj };
    } else {
      return { error: "not found" };
    }
  }
}

const MAX_PAD_NUM = 999;
class UserApi extends BaseApi {
  constructor() {
    const defaultEntity = {
      name: "",
      email: "",
      daoTrang: "",
      daotrangcu: [],
      admin: false,
      birth: "",
      phone: "",
      zalo: "",
      facebook: "",
      gmail: "",
      address: "", //dia chi NB
      address2: "", //dia chi VN
      ngayVaoDaoTrang: "",
      ngayLenGieoDuyen: "",
      ngayLenTuyHy: "",
      ngayLenDuThinh: "",
      ngayLenChinhThuc: "",
      phapDanh: "",
      thanhPhan: "", // A, B, C , D
      ngheNghiep: "",
      kyNang: "",
      tenFb: "",
      cachDTT: "",
      bach7: "", // 0:chưa|1:đang|2:bạch xong
      bach49: "",
      bach108:"",
      nguoiHuongDan: "",
    };
    super("users", defaultEntity);
  }

  async getAllMembers(daoTrangId) {
    return await this.query(where("daoTrang", "==", daoTrangId));
  }
  async getMembers(accounts) {
    return await this.query(where("email", "in", accounts));
  }
  async genAccount(name) {
    try {
      // generate account
      var account = shortenName(name);

      const ref = collection(db, this.collectionName);
      const q = query(
        ref,
        where("email", ">=", account),
        where("email", "<=", `${account}${MAX_PAD_NUM}`)
      );
      const querySnapshot = await getDocs(q);
      const users = snapshotToArray(querySnapshot);

      // add to cache
      users.forEach((u) => this.map.set(u.id, cloneObj(u)));

      // console.log(account, found);
      if (users.length > 0) {
        const lst = users.map((u) => u.email);
        for (var i = lst.length + 1; i > 0; i--) {
          if (!lst.includes(`${account}${i}`)) {
            account = `${account}${i}`;
            break;
          }
        }
      }

      return { result: { account, users } };
    } catch (ex) {
      return { error: ex.message };
    }
  }
}


const userApi = new UserApi();

export const getAllMembers = (daoTrangId, token) => userApi.getAllMembers(daoTrangId, token);
export const getMembers = (accounts, token) => userApi.getMembers(accounts, token);
export const getAllUsers = (user, token) => userApi.getAll(token);
export const createUser = (user, token) => userApi.create(user, token);
export const updateUser = (id, changes, token) => userApi.update(id, changes, token);
export const saveUser = (user, token) => userApi.save(user, token);
export const removeUser = (id, token) => userApi.remove(id, token);
export const saveOrCreateUser = (user, token) => userApi.saveOrCreate(user, token);
export const genAccount = (name, token) => userApi.genAccount(name, token);
export const newDefaultUser = () => cloneObj(userApi.defaultEntity);

export const USER_THANH_PHAN = [
  {
    label: "Chính thức",
    value: "A",
  },
  {
    label: "Dự thính",
    value: "B",
  },
  {
    label: "Tùy hỷ",
    value: "C",
  },
  {
    label: "Gieo duyên",
    value: "D",
  },
  {
    label: "Tín chủ mới",
    value: "E",
  },
];

function shortenName(name) {
  var arr = latinize(name).split(" ");
  var account = arr[arr.length - 1];
  for (var i = 0; i < arr.length - 1; i++) {
    account = account + arr[i][0];
  }
  account = account.toLowerCase();
  return account;
}

export function cloneObj(u) {
  return { ...u };
}

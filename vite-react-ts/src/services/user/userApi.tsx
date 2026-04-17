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
  type QueryConstraint,
  type Query,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { calcPath as calcPatch, snapshotToArray } from "../../utils/fbUtil";
// import latinize from "latinize";

/**
 * Splits an array into chunks of a specified size.
 * @param {Array} arr
 * @param {number} size
 * @returns {Array[]}
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

function getErrorMessage(ex: unknown): string {
  return ex instanceof Error ? ex.message : String(ex);
}

/**
 * CURD
 */

export class BaseApi {
  collectionName: string;
  defaultEntity: Record<string, unknown>;
  constructor(collectionName: string, defaultEntity: Record<string, unknown>) {
    this.collectionName = collectionName;
    // this.map = new Map();
    this.defaultEntity = defaultEntity;
  }

  async remove(id: string) {
    try {
      console.log("delete", this.collectionName, "/", id);

      await deleteDoc(doc(db, this.collectionName, id));
      return { result: { id } };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }

  async removeAll(w: QueryConstraint) {
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
      const commitBatchPromises: Promise<void>[] = [];
      const deletedIds: string[] = [];

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
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }

  async update(id: string, changes: Record<string, unknown>) {
    try {
      console.log("update", this.collectionName, "/", id, changes);

      // check cache
      // if (!this.map.has(id)) {
      //   return { error: "id not in cache!" };
      // }

      const ref = doc(db, this.collectionName, id);
      await updateDoc(ref, changes);

      // update cache
      // const u = this.map.get(id);
      // Object.keys(changes).forEach((key) => (u[key] = changes[key]));

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
      } catch (error: unknown) {
        console.log(getErrorMessage(error));
      }

      return { result: { id } };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }
  async update3(
    before: { id: string },
    changes: Record<string, unknown>,
    denomalize?: ((doc: Record<string, unknown>) => void) | null
  ) {
    try {
      const id = before.id;

      const ref = doc(db, this.collectionName, id);
      if (denomalize) {
        const docForFirestore = { ...changes };
        denomalize(docForFirestore);
        await updateDoc(ref, docForFirestore);
      } else {
        await updateDoc(ref, changes);
      }

      // update cache
      // const u = this.map.get(id);
      // Object.keys(changes).forEach((key) => (u[key] = changes[key]));

      // add log
      try {
        const after = { ...before, ...changes };
        const text = calcPatch(before, after);
        const logRef = collection(db, this.collectionName + "_log");
        const logDocRef = await addDoc(logRef, {
          action: "update",
          patch: text,
          itemId: id,
          timestamp: Timestamp.now(),
        });
        console.log("logDocRef:", logDocRef.id);
      } catch (error: unknown) {
        console.log(getErrorMessage(error));
      }

      return { result: { id } };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }

  async update2(
    before: { id: string },
    changes: Record<string, unknown>
  ) {
    return this.update3(before, changes, null);
  }

  async getLog(id: string) {
    try {
      const ref = collection(db, this.collectionName + "_log");
      const q = query(ref, where("itemId", "==", id));
      const querySnapshot = await getDocs(q);
      const result = snapshotToArray(querySnapshot);

      return { result };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }
  async updateLog(logId: string, changes: Record<string, unknown>) {
    try {
      const ref = doc(db, this.collectionName + "_log", logId);
      await updateDoc(ref, changes);
      return { result: true };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }
  /**
   *
   * @param {object} entity {id, ...}
   * @returns
   */
  async save(entity: Record<string, unknown> & { id?: string | null }) {
    return this.saveOrCreate(entity);
  }

  async saveOrCreate(entity: Record<string, unknown> & { id?: string | null }) {
    try {
      const id = entity.id;
      if (!id) {
        return { error: "missing id!" };
      }

      const body: Record<string, unknown> = {};
      Object.keys(this.defaultEntity).forEach((key) => {
        body[key] = entity[key] ?? this.defaultEntity[key];
      });

      const ref = doc(db, this.collectionName, id);
      await setDoc(ref, body);

      // save to cache
      body.id = id;
      // this.map.set(id, cloneObj(body));

      return { result: body };
    } catch (ex: unknown) {
      console.log(getErrorMessage(ex));
      return { error: getErrorMessage(ex) };
    }
  }

  // async save(entity) {
  //   try {
  //     const id = entity.id;
  //     if (!id) {
  //       return { error: "missing id!" };
  //     }

  //     const old = this.map.get(id);
  //     const changes = {};
  //     Object.keys(this.defaultEntity).forEach((key) => {
  //       if (entity[key] !== old[key]) {
  //         changes[key] = entity[key];
  //       }
  //     });

  //     if (Object.keys(changes).length > 0) {
  //       return await this.update(id, changes);
  //     } else {
  //       console.log("no change");
  //       return { result: cloneObj(old) };
  //     }
  //   } catch (ex) {
  //     console.log(ex.message);
  //     return { error: ex.message };
  //   }
  // }

  /**
   * entity not has property id
   * @param {} entity
   * @returns
   */
  async create({ id = null, ...entity }: Record<string, unknown> & { id?: string | null }) {
    try {
      const body: Record<string, unknown> = {};
      Object.keys(this.defaultEntity).forEach((key) => {
        body[key] = entity[key] ?? this.defaultEntity[key];
      });

      if (id) {
        const ref = doc(db, this.collectionName, id);
        await setDoc(ref, body);
        body.id = id;
        // this.map.set(id, cloneObj(body));
      } else {
        const ref = collection(db, this.collectionName);
        const docRef = await addDoc(ref, body);
        console.log(docRef.id);
        // save to cache
        body.id = docRef.id;
        // this.map.set(docRef.id, cloneObj(body));
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
      } catch (error: unknown) {
        console.log(getErrorMessage(error));
      }

      return { result: body };
    } catch (ex: unknown) {
      console.log(getErrorMessage(ex));
      return { error: getErrorMessage(ex) };
    }
  }

  async query(w: QueryConstraint) {
    try {
      const ref = collection(db, this.collectionName);
      const q = query(ref, w);
      const querySnapshot = await getDocs(q);
      const result = snapshotToArray(querySnapshot);

      return { result };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }
  
  async query2(q: Query<unknown>) {
    try {
      const querySnapshot = await getDocs(q);
      const result = snapshotToArray(querySnapshot);

      // result.forEach((u) => this.map.set(u.id, cloneObj(u)));
      return { result };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }

  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const result = snapshotToArray(querySnapshot);

      return { result };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }

  async getOne(id: string) {
    const ref = doc(db, this.collectionName, id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const obj = { ...docSnap.data(), id: docSnap.id };
      // this.map.set(obj.id, cloneObj(obj));
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

  async getAllMembers(daoTrangId: string) {
    return await this.query(where("daoTrang", "==", daoTrangId));
  }
  async getMembers(accounts: string[]) {
    return await this.query(where("email", "in", accounts));
  }
  async genAccount(name: string) {
    try {
      let account = shortenName(name);

      const ref = collection(db, this.collectionName);
      const q = query(
        ref,
        where("email", ">=", account),
        where("email", "<=", `${account}${MAX_PAD_NUM}`)
      );
      const querySnapshot = await getDocs(q);
      const users = snapshotToArray(querySnapshot);

      if (users.length > 0) {
        const lst = users.map((u) => u.email);
        for (let i = lst.length + 1; i > 0; i--) {
          if (!lst.includes(`${account}${i}`)) {
            account = `${account}${i}`;
            break;
          }
        }
      }

      return { result: { account, users } };
    } catch (ex: unknown) {
      return { error: getErrorMessage(ex) };
    }
  }
}


const userApi = new UserApi();

export const getAllMembers = (daoTrangId: string, token?: string) => {
  void token;
  return userApi.getAllMembers(daoTrangId);
};
export const getMembers = (accounts: string[], token?: string) => {
  void token;
  return userApi.getMembers(accounts);
};
export const getAllUsers = (_user: unknown, token?: string) => {
  void _user;
  void token;
  return userApi.getAll();
};
export const createUser = (user: Record<string, unknown>, token?: string) => {
  void token;
  return userApi.create(user);
};
export const updateUser = (
  id: string,
  changes: Record<string, unknown>,
  token?: string
) => {
  void token;
  return userApi.update(id, changes);
};
export const saveUser = (user: Record<string, unknown>, token?: string) => {
  void token;
  return userApi.save(user);
};
export const removeUser = (id: string, token?: string) => {
  void token;
  return userApi.remove(id);
};
export const saveOrCreateUser = (
  user: Record<string, unknown>,
  token?: string
) => {
  void token;
  return userApi.saveOrCreate(user);
};
export const genAccount = (name: string, token?: string) => {
  void token;
  return userApi.genAccount(name);
};
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

function shortenName(name: string): string {
  const arr = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (arr.length === 0) {
    return "";
  }

  let account = arr[arr.length - 1];
  for (let i = 0; i < arr.length - 1; i++) {
    account = account + (arr[i][0] ?? "");
  }
  return account.toLowerCase();
}

export function cloneObj<T>(u: T): T {
  return { ...u };
}

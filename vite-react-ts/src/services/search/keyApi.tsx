import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BaseApi } from "../user/userApi";

type KeyTitle = {
  titleId: number;
  paras: Array<{ paraId: number; pos: number[] }>;
};

type KeyResult = {
  keyId: number;
  titles: KeyTitle[];
};

/**
 * CURD
 */

class KeyApi extends BaseApi {
  constructor() {
    super("keys", { keyId: 0, titles: [] });
  }

  async getKey(keyId: string | number, mode: "QA" | "BBH") {
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
      const map = new Map<number, KeyTitle>();
      const grps: { data: string; }[] = [];
      
      // const querySnapshot = await getDocs(
      //   collection(db, mode === "QA" ? `keys/${keyId}/t` : `bbh_keys/${keyId}/t`)
      // );
      // querySnapshot.forEach((docSnap) => {
      //   // doc.data() is never undefined for query doc snapshots
      //   const grp = docSnap.data() as { data: string };
      //   grps.push(grp);
      // });

      const collectionPath = mode === "BBH" ? "bbh_keys" : "keys";
      const result = await fetch(`/${collectionPath}/${keyId}.json`);
      const grp = await result.json();
      grps.push(grp);
      grps.forEach((grp) => {
        const tlst = grp.data.split("T");
        tlst.shift();
        tlst.forEach((t) => {
          const tObj: KeyTitle = { titleId: 0, paras: [] };
          const plst = t.split("P");
          const p1st = plst.shift() || "0";
          tObj.titleId = parseInt(p1st, 10);
          plst.forEach((p) => {
            const arr = p
              .split(",")
              .map((x: string) => parseInt(x, 10));
            const paraId = arr.shift() ?? 0;
            tObj.paras.push({ paraId: Number(paraId), pos: arr as number[] });
          });
          map.set(tObj.titleId, tObj);
        });
      });

      // create key object
      const keyObj: KeyResult = {
        keyId: Number(keyId),
        titles: Array.from(map.values()),
      };

      // update cache
      // this.map.clear();
      // result.forEach((u) => this.map.set(u.id, cloneObj(u)));
      // console.log("fetched key ", keyId, keyObj);
      return { result: keyObj };
    } catch (ex: unknown) {
      if (ex instanceof Error) {
        return { error: ex.message };
      }
      return { error: String(ex) };
    }
  }
}
const keyApi = new KeyApi();
export const getKey = (id: string | number, mode: "QA" | "BBH" = "QA") =>
  keyApi.getKey(id, mode);

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

  async fetchNextPage(
    collectionName: string,
    pageSize = 100,
    lastDoc: unknown = null,
    tag: string | null = null,
  ) {
    const q = lastDoc
      ? query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      )
      : query(
        collection(db, collectionName),
        where("tags", "array-contains", tag),
        orderBy("titleId", "desc"),
        limit(pageSize)
      );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // records.forEach((u) => this.map.set(u.id, cloneObj(u)));

    const nextCursor =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    const result = {
      records,
      nextCursor,
      hasMore: snapshot.size === pageSize,
    };
    return { result };
  }
  
  async update2(
    before: { id: string },
    changes: Record<string, unknown>
  ) {
    return this.update3(before, changes, denormalizeTitle);
  }
}
const titleApi = new TitleApi();
const originalTitleGet = titleApi.getOne;
type TitleRecord = { [key: string]: unknown } & {
  titleId?: number | string;
  createdAt?: { toMillis: () => number };
  createdAtMs?: number;
};

function normalizeTitle(title: TitleRecord) {
  if (title.titleId !== undefined) {
    title.titleId = Number(title.titleId);
  }
  if (title.createdAt) {
    title.createdAtMs = title.createdAt.toMillis();
    delete title.createdAt;
  }
}
function denormalizeTitle(title: TitleRecord) {
  if (typeof title.createdAtMs === "number") {
    title.createdAt = Timestamp.fromMillis(title.createdAtMs);
    delete title.createdAtMs;
  }
}
function titleWrapMethod(originalMethod: typeof titleApi.getOne) {
  return (async function (this: unknown, id: string) {
    const result = await originalMethod.apply(this as unknown, [id]);
    if (result && typeof result === "object" && "result" in result) {
      const safeResult = result as { result?: unknown };
      if (Array.isArray(safeResult.result)) {
        safeResult.result.forEach((title) => {
          if (typeof title === "object" && title !== null) {
            normalizeTitle(title as TitleRecord);
          }
        });
      } else if (typeof safeResult.result === "object" && safeResult.result !== null) {
        normalizeTitle(safeResult.result as TitleRecord);
      }
    }
    return result;
  }) as typeof titleApi.getOne;
}
titleApi.getOne = titleWrapMethod(originalTitleGet);

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
const titleApi2 = new TitleApi2();
titleApi2.getOne = titleWrapMethod(titleApi2.getOne);

export const updateTitle2 = (
  before: { id: string },
  changes: Record<string, unknown>,
  mode: "QA" | "BBH" = "QA"
) =>
  mode === "QA" ? titleApi.update2(before, changes) : titleApi2.update2(before, changes);
export const getTitleLog2 = (id: string, mode: "QA" | "BBH" = "QA") =>
  mode === "QA" ? titleApi.getLog(id) : titleApi2.getLog(id);
export const updateTitleLog2 = (
  logId: string,
  changes: Record<string, unknown>,
  mode: "QA" | "BBH" = "QA"
) =>
  mode === "QA" ? titleApi.updateLog(logId, changes) : titleApi2.updateLog(logId, changes);
export const getTitle = (id: string, mode: "QA" | "BBH" = "QA") =>
  mode === "QA" ? titleApi.getOne(id) : titleApi2.getOne(id);
export const fetchTitleNextPage = (
  collectionName: string,
  pageSize = 100,
  lastDoc: unknown = null,
  tag: string | null = null
) => titleApi.fetchNextPage(collectionName, pageSize, lastDoc, tag);
class TagApi extends BaseApi {
  constructor() {
    const defaultEntity = { tag: "" };
    super("tags", defaultEntity);
  } 
}
const tagApi = new TagApi();
export const getAllTags = () => tagApi.getAll();
export const createTag = (tag: Record<string, unknown>, token?: string) => {
  void token;
  return tagApi.create(tag);
};
export const updateTag = (
  id: string,
  changes: Record<string, unknown>,
  token?: string
) => {
  void token;
  return tagApi.update(id, changes);
};
export const saveTag = (tag: Record<string, unknown>, token?: string) => {
  void token;
  return tagApi.saveOrCreate(tag);
};
export const removeTag = (id: string, token?: string) => {
  void token;
  return tagApi.remove(id);
};
export const saveOrCreateTag = (tag: Record<string, unknown>, token?: string) => {
  void token;
  return tagApi.saveOrCreate(tag);
};

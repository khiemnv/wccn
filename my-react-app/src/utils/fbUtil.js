import { diff_match_patch } from "diff-match-patch";

export function createEntity(doc, entity = {}) {
  return {
    id: doc.id,
    ...entity,
  };
}

export function snapshotToArray(snapshot) {
  const lst = [];
  snapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    // console.log(doc.id, " => ", doc.data());
    lst.push({
      ...doc.data(),
      id: doc.id,
    });
  });
  return lst;
}

 export function calcPath(before, after) { 
    // calc patch
    var dmp = new diff_match_patch();
    var patches = dmp.patch_make(JSON.stringify(before), JSON.stringify(after));
    var text = dmp.patch_toText(patches)
    return text;
  }

 export function rApplyPath(after, text) {
    var dmp = new diff_match_patch();
    var patches = dmp.patch_fromText(text)
    patches.forEach(patch => {
      patch.diffs = patch.diffs.map(([op, data]) => {
        if (op === diff_match_patch.DIFF_INSERT) return [diff_match_patch.DIFF_DELETE, data];
        if (op === diff_match_patch.DIFF_DELETE) return [diff_match_patch.DIFF_INSERT, data];
        return [op, data]; // DIFF_EQUAL stays the same
      });
    });
    var [before, results] = dmp.patch_apply(patches, after);
    console.log("rApplyPath: ", results);
    if (results.every(r=>r)){
      return {result: before};
    }
    else {
      return {error: results.join()}
    }
  }
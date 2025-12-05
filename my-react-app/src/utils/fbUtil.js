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
  var patches = dmp.patch_make(stableStringify(before), stableStringify(after));
  var text = dmp.patch_toText(patches)
  return text;
}

export function decodeDiffText(text) {
  // %5Cn ¨ \n th?t
  let decoded = text.replace(/%5C[nr]/gi, "\\n");

  // URL decode
  try {
    decoded = decodeURIComponent(decoded);
  } catch (e) {
    // n?u l?i th? gi? nguy?n
  }

  return decoded;
}
function dmpPatchToUnified(patchText, oldName = "a/file", newName = "b/file") {
  const lines = patchText.split("\n");
  let output = `--- ${oldName}\n+++ ${newName}\n`;

  for (const line of lines) {
    if (!line) continue;

    if (line.startsWith("@@")) {
      // Patch hunk header
      output += line + "\n";
    } else if (line.startsWith("-")) {
      // deletion
      output += "-" + line.substring(1) + "\n";
    } else if (line.startsWith("+")) {
      // insertion
      output += "+" + line.substring(1) + "\n";
    } else if (line.startsWith(" ")) {
      // context
      output += " " + line.substring(1) + "\n";
    } else {
      // Unknown ¨ copy as is
      output += line + "\n";
    }
  }

  return output;
}
export function createUnifiedDiff(oldStr, newStr, fileName = "file.txt") {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(oldStr, newStr);
    dmp.diff_cleanupSemantic(diffs);

    const oldLines = oldStr.split("\n");
    const newLines = newStr.split("\n");

    let oldLineNum = 1;
    let newLineNum = 1;

    // Unified diff header
    let result = `--- a/${fileName}\n+++ b/${fileName}\n`;

    // Start first hunk
    let hunk = [];
    let hunkOldStart = oldLineNum;
    let hunkNewStart = newLineNum;

    diffs.forEach(([op, text]) => {
        const lines = text.split("\n");

        if (op === 0) {
            // equal
            lines.forEach((line, i) => {
                hunk.push(` ${line}`);
                oldLineNum++;
                newLineNum++;
            });
        } else if (op === -1) {
            // delete
            lines.forEach((line) => {
                hunk.push(`-${line}`);
                oldLineNum++;
            });
        } else if (op === 1) {
            // add
            lines.forEach((line) => {
                hunk.push(`+${line}`);
                newLineNum++;
            });
        }
    });

    const oldCount = oldLines.length;
    const newCount = newLines.length;

    result += `@@ -${hunkOldStart},${oldCount} +${hunkNewStart},${newCount} @@\n`;
    result += hunk.join("\n");

    return result;
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
  if (results.every(r => r)) {
    return { result: before };
  }
  else {
    console.log(after);
    console.log(decodeDiffText(dmp.patch_toText(patches)));
    return { error: results.join() }
  }
}

function sortObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

export function stableStringify(obj, space = 2) {
  return JSON.stringify(sortObject(obj), null, space);
}
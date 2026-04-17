import type { QuerySnapshot } from "firebase/firestore";
import diff_match_patch from "diff-match-patch";

export function createEntity(
  doc: { id: string },
  entity: Record<string, unknown> = {}
): Record<string, unknown> & { id: string } {
  return {
    id: doc.id,
    ...entity,
  };
}

export function snapshotToArray(
  snapshot: QuerySnapshot<unknown>
): Array<Record<string, unknown> & { id: string }> {
  const lst: Array<Record<string, unknown> & { id: string }> = [];
  snapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    // console.log(doc.id, " => ", doc.data());
    lst.push({
      ...(doc.data() as Record<string, unknown>),
      id: doc.id,
    });
  });
  return lst;
}

export function calcPath(before: unknown, after: unknown): string {
  const dmp = new diff_match_patch();
  const patches = dmp.patch_make(stableStringify(before), stableStringify(after));
  const text = dmp.patch_toText(patches);
  return text;
}

export function decodeDiffText(text: string): string {
  let decoded = text.replace(/%5C[nr]/gi, "\\n");

  // URL decode
  try {
    decoded = decodeURIComponent(decoded);
  } catch (e: unknown) {
    void e;
  }

  return decoded;
}

export function createUnifiedDiff(
  oldStr: string,
  newStr: string,
  fileName = "file.txt"
): string {
    const dmp = new diff_match_patch();
    const diffs: Array<[number, string]> = dmp.diff_main(oldStr, newStr);
    dmp.diff_cleanupSemantic(diffs);

    const oldLines = oldStr.split("\n");
    const newLines = newStr.split("\n");

    let oldLineNum = 1;
    let newLineNum = 1;

    // Unified diff header
    let result = `--- a/${fileName}\n+++ b/${fileName}\n`;

    // Start first hunk
    const hunk: string[] = [];
    const hunkOldStart = oldLineNum;
    const hunkNewStart = newLineNum;

    diffs.forEach(([op, text]) => {
        const lines = text.split("\n");

        if (op === 0) {
            // equal
            lines.forEach((line) => {
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

type PatchObj = InstanceType<typeof diff_match_patch.patch_obj>;
type DiffObj = diff_match_patch.Diff;

export function rApplyPath(
  after: string,
  text: string
): { result: string } | { error: string } {
  const dmp = new diff_match_patch();
  const patches = dmp.patch_fromText(text) as unknown as PatchObj[];
  patches.forEach((patch) => {
    patch.diffs = patch.diffs.map(([op, data]: DiffObj) => {
      if (op === diff_match_patch.DIFF_INSERT) return [diff_match_patch.DIFF_DELETE, data];
      if (op === diff_match_patch.DIFF_DELETE) return [diff_match_patch.DIFF_INSERT, data];
      return [op, data]; // DIFF_EQUAL stays the same
    });
  });
  const [before, results] = dmp.patch_apply(
    patches as unknown as Array<typeof diff_match_patch.patch_obj>,
    after
  );
  console.log("rApplyPath: ", results);
  if (results.every((r) => r)) {
    return { result: before };
  } else {
    console.log(after);
    console.log(
      decodeDiffText(
        dmp.patch_toText(patches as unknown as Array<typeof diff_match_patch.patch_obj>)
      )
    );
    return { error: results.join() };
  }
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        const record = result as Record<string, unknown>;
        const source = obj as Record<string, unknown>;
        record[key] = sortObject(source[key]);
        return record;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

export function stableStringify(obj: unknown, space = 2): string {
  return JSON.stringify(sortObject(obj), null, space);
}
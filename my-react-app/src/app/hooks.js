import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { getAllTags } from '../services/search/keyApi';
import { addTag, editTag, selectTags, setTags } from '../features/search/searchSlice';


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch
export const useAppSelector = useSelector

export function useTagsSubscription(db, setAlertObj) {
  const dispatch = useDispatch();

  useEffect(() => {
    const now = Timestamp.now();
    const q = query(
      collection(db, "/tags_log"),
      where("timestamp", ">=", now)
    );

    console.log("[Subscribe] Start at:", now.toDate().toLocaleString());

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const { id: logId } = change.doc;
          const { json, action, itemId, timestamp } = change.doc.data();

          console.log(
            `TAG log: [${logId}] ${action} [${itemId}] at ${timestamp
              .toDate()
              .toLocaleString()}`
          );
          console.log("content: ", json);

          function apply() {
            try {
              const obj = JSON.parse(json);
              switch (action) {
                case "create":
                  dispatch(addTag({ tag: obj }));
                  break;
                case "update":
                  dispatch(editTag({ id: itemId, changes: obj }));
                  break;
                default:
                  console.warn("Unknown action:", action);
              }

              if (setAlertObj) {
                setAlertObj({
                  open: true,
                  type: "info",
                  message:
                    "?? c?p nh?t thay ??i tags: " +
                    timestamp.toDate().toLocaleString(),
                });
              }
            } catch (e) {
              console.error("[Realtime] JSON parse error:", e, json);
            }
          }

          apply();
        });
      }
    );

    return () => {
      console.log("[Subscribe] Unsubscribed");
      unsubscribe();
    };
  }, [db, dispatch, setAlertObj]);
}
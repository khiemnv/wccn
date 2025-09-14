export function createEntity(doc, entity = {}) {
  return {
    _id: doc.id,
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
      _id: doc.id,
    });
  });
  return lst;
}

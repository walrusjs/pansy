Object.values =
  Object.values ||
  ((obj: { [k: string]: any }) => Object.keys(obj).map(i => obj[i]));

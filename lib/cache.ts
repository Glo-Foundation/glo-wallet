const cache: {
  [key: string]: {
    value: string;
    ts: number;
  };
} = {};

export const set = (key: string, value: string, seconds: number) => {
  cache[key] = {
    value,
    ts: Date.now() + seconds * 1000,
  };
};

export const get = (key: string) => {
  const item = cache[key];

  if (!item) {
    return null;
  }

  if (item.ts <= Date.now()) {
    delete cache[key];
    return null;
  }

  return item.value;
};

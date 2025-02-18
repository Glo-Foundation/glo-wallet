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

export async function cachedOrFetch<T>(
  key: string,
  fetchMethod: () => Promise<T>
): Promise<T> {
  const cached = get(key);

  if (cached) {
    const json = JSON.parse(cached);
    return json as T;
  }

  const rows = await fetchMethod();

  set(key, JSON.stringify(rows), 60 * 60);

  return rows;
}

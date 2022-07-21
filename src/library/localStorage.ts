const localStorageInstance = typeof window !== 'undefined' ? window.localStorage : undefined;

const LocalStorage = {
  get<T>(key: string): T | null {
    const result = localStorageInstance?.getItem(key);
    return result ? JSON.parse(result) : null;
  },
  set<T>(key: string, value: T) {
    const stringifiedValue = JSON.stringify(value);
    localStorageInstance?.setItem(key, stringifiedValue);
  },
  remove(key: string) {
    localStorageInstance?.removeItem(key);
  },
  clear() {
    localStorageInstance?.clear();
  }
};

export default LocalStorage;

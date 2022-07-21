const sessionStorageInstance = typeof window !== 'undefined' ? window.sessionStorage : undefined;

const SessionStorage = {
  get<T>(key: string): T | null {
    const result = sessionStorageInstance?.getItem(key);
    return result ? JSON.parse(result) : null;
  },
  set<T>(key: string, value: T) {
    const stringifiedValue = JSON.stringify(value);
    sessionStorageInstance?.setItem(key, stringifiedValue);
  },
  remove(key: string) {
    sessionStorageInstance?.removeItem(key);
  }
};

export default SessionStorage;

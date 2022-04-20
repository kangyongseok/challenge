/* eslint @typescript-eslint/no-explicit-any: 'off' */
class LocalStorage {
  private readonly localStorage;

  constructor() {
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
  }

  get(key: string): any | null {
    const result = this.localStorage?.getItem(key);
    return result ? JSON.parse(result) : null;
  }

  set(key: string, value: any): { key: string; value: any } {
    const stringifiedValue = JSON.stringify(value);
    this.localStorage?.setItem(key, stringifiedValue);
    return { key, value };
  }

  remove(key: string): { key: string; value: any | null } {
    const value = this.get(key);
    this.remove(key);
    return { key, value };
  }

  clear(): void {
    this.localStorage?.clear();
  }
}

export default new LocalStorage();

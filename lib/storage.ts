// A safe way to access localStorage that works during SSR
type StorageType = 'local' | 'session';

const createStorage = (type: StorageType) => {
  if (typeof window === 'undefined') {
    return {
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {},
      clear: () => {},
    };
  }
  
  const storage = type === 'local' ? window.localStorage : window.sessionStorage;
  return {
    getItem: (key: string) => {
      try {
        return storage.getItem(key);
      } catch (error) {
        console.error(`Error getting ${key} from ${type}Storage:`, error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        storage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting ${key} in ${type}Storage:`, error);
      }
    },
    removeItem: (key: string) => {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from ${type}Storage:`, error);
      }
    },
    clear: () => {
      try {
        storage.clear();
      } catch (error) {
        console.error(`Error clearing ${type}Storage:`, error);
      }
    },
  };
};

export const safeLocalStorage = createStorage('local');
export const safeSessionStorage = createStorage('session');

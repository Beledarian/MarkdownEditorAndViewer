const DB_NAME = 'md-editor-db';
const STORE_NAME = 'handles';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE_NAME);
    };
  });
};

export const saveDirectoryHandle = async (handle) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, 'root-dir');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDirectoryHandle = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('root-dir');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

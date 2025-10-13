/**
 * IndexedDB service for storing and retrieving chord data
 */

const DB_NAME = 'ChordComponentsDB';
const DB_VERSION = 2; // Incremented for new store
const STORE_NAME = 'chordData';
const USER_STORE_NAME = 'userChords';

export interface ChordData {
  instrument: string;
  chords: Record<string, any>;
  timestamp: number;
}

export interface UserChordData {
  key: string; // composite key: "instrument:chordName"
  instrument: string;
  chordName: string;
  fingers: any[];
  barres: any[];
  position?: number; // Starting fret position (1 = first fret, etc.)
  timestamp: number;
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize and open the database
   */
  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create chord data store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'instrument' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create user chords store if it doesn't exist
        if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
          const userStore = db.createObjectStore(USER_STORE_NAME, { keyPath: 'key' });
          userStore.createIndex('instrument', 'instrument', { unique: false });
          userStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Get chord data for a specific instrument from IndexedDB
   */
  async getChordData(instrument: string): Promise<ChordData | null> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(instrument);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(new Error(`Failed to get chord data: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      return null;
    }
  }

  /**
   * Store chord data for a specific instrument in IndexedDB
   */
  async setChordData(instrument: string, chords: Record<string, any>): Promise<void> {
    try {
      const db = await this.openDB();

      const data: ChordData = {
        instrument,
        chords,
        timestamp: Date.now()
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.put(data);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to store chord data: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  }

  /**
   * Get all stored instruments
   */
  async getAllInstruments(): Promise<string[]> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          reject(new Error(`Failed to get instruments: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      return [];
    }
  }

  /**
   * Clear all chord data from IndexedDB
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to clear data: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  }

  /**
   * Check if IndexedDB is available
   */
  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Save a user-defined chord
   */
  async saveUserChord(instrument: string, chordName: string, chordData: { fingers: any[], barres: any[], position?: number }): Promise<void> {
    try {
      const db = await this.openDB();

      const data: UserChordData = {
        key: `${instrument}:${chordName}`,
        instrument,
        chordName,
        fingers: chordData.fingers,
        barres: chordData.barres,
        position: chordData.position,
        timestamp: Date.now()
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const request = objectStore.put(data);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to save user chord: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  }

  /**
   * Get a user-defined chord
   */
  async getUserChord(instrument: string, chordName: string): Promise<UserChordData | null> {
    try {
      const db = await this.openDB();
      const key = `${instrument}:${chordName}`;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const request = objectStore.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(new Error(`Failed to get user chord: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      return null;
    }
  }

  /**
   * Delete a user-defined chord
   */
  async deleteUserChord(instrument: string, chordName: string): Promise<void> {
    try {
      const db = await this.openDB();
      const key = `${instrument}:${chordName}`;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const request = objectStore.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to delete user chord: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  }

  /**
   * Get all user-defined chords for an instrument
   */
  async getUserChordsByInstrument(instrument: string): Promise<UserChordData[]> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const index = objectStore.index('instrument');
        const request = index.getAll(instrument);

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(new Error(`Failed to get user chords: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      return [];
    }
  }

  /**
   * Get all user-defined chords
   */
  async getAllUserChords(): Promise<UserChordData[]> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(new Error(`Failed to get all user chords: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      return [];
    }
  }

  /**
   * Clear all user-defined chords
   */
  async clearUserChords(): Promise<void> {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to clear user chords: ${request.error}`));
        };
      });
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  }
}

export const indexedDBService = new IndexedDBService();

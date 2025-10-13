const b = "ChordComponentsDB";
const d = "chordData", c = "userChords";
class h {
  constructor() {
    this.dbPromise = null;
  }
  /**
   * Initialize and open the database
   */
  async openDB() {
    return this.dbPromise ? this.dbPromise : (this.dbPromise = new Promise((e, o) => {
      const r = indexedDB.open(b, 2);
      r.onerror = () => {
        o(new Error(`Failed to open IndexedDB: ${r.error}`));
      }, r.onsuccess = () => {
        e(r.result);
      }, r.onupgradeneeded = (n) => {
        const s = n.target.result;
        if (s.objectStoreNames.contains(d) || s.createObjectStore(d, { keyPath: "instrument" }).createIndex("timestamp", "timestamp", { unique: !1 }), !s.objectStoreNames.contains(c)) {
          const t = s.createObjectStore(c, { keyPath: "key" });
          t.createIndex("instrument", "instrument", { unique: !1 }), t.createIndex("timestamp", "timestamp", { unique: !1 });
        }
      };
    }), this.dbPromise);
  }
  /**
   * Get chord data for a specific instrument from IndexedDB
   */
  async getChordData(e) {
    try {
      const o = await this.openDB();
      return new Promise((r, n) => {
        const i = o.transaction([d], "readonly").objectStore(d).get(e);
        i.onsuccess = () => {
          r(i.result || null);
        }, i.onerror = () => {
          n(new Error(`Failed to get chord data: ${i.error}`));
        };
      });
    } catch (o) {
      return console.error("IndexedDB error:", o), null;
    }
  }
  /**
   * Store chord data for a specific instrument in IndexedDB
   */
  async setChordData(e, o) {
    try {
      const r = await this.openDB(), n = {
        instrument: e,
        chords: o,
        timestamp: Date.now()
      };
      return new Promise((s, t) => {
        const a = r.transaction([d], "readwrite").objectStore(d).put(n);
        a.onsuccess = () => {
          s();
        }, a.onerror = () => {
          t(new Error(`Failed to store chord data: ${a.error}`));
        };
      });
    } catch (r) {
      throw console.error("IndexedDB error:", r), r;
    }
  }
  /**
   * Get all stored instruments
   */
  async getAllInstruments() {
    try {
      const e = await this.openDB();
      return new Promise((o, r) => {
        const t = e.transaction([d], "readonly").objectStore(d).getAllKeys();
        t.onsuccess = () => {
          o(t.result);
        }, t.onerror = () => {
          r(new Error(`Failed to get instruments: ${t.error}`));
        };
      });
    } catch (e) {
      return console.error("IndexedDB error:", e), [];
    }
  }
  /**
   * Clear all chord data from IndexedDB
   */
  async clearAll() {
    try {
      const e = await this.openDB();
      return new Promise((o, r) => {
        const t = e.transaction([d], "readwrite").objectStore(d).clear();
        t.onsuccess = () => {
          o();
        }, t.onerror = () => {
          r(new Error(`Failed to clear data: ${t.error}`));
        };
      });
    } catch (e) {
      throw console.error("IndexedDB error:", e), e;
    }
  }
  /**
   * Check if IndexedDB is available
   */
  isAvailable() {
    return typeof indexedDB < "u";
  }
  /**
   * Save a user-defined chord
   */
  async saveUserChord(e, o, r) {
    try {
      const n = await this.openDB(), s = {
        key: `${e}:${o}`,
        instrument: e,
        chordName: o,
        fingers: r.fingers,
        barres: r.barres,
        position: r.position,
        timestamp: Date.now()
      };
      return new Promise((t, i) => {
        const l = n.transaction([c], "readwrite").objectStore(c).put(s);
        l.onsuccess = () => {
          t();
        }, l.onerror = () => {
          i(new Error(`Failed to save user chord: ${l.error}`));
        };
      });
    } catch (n) {
      throw console.error("IndexedDB error:", n), n;
    }
  }
  /**
   * Get a user-defined chord
   */
  async getUserChord(e, o) {
    try {
      const r = await this.openDB(), n = `${e}:${o}`;
      return new Promise((s, t) => {
        const a = r.transaction([c], "readonly").objectStore(c).get(n);
        a.onsuccess = () => {
          s(a.result || null);
        }, a.onerror = () => {
          t(new Error(`Failed to get user chord: ${a.error}`));
        };
      });
    } catch (r) {
      return console.error("IndexedDB error:", r), null;
    }
  }
  /**
   * Delete a user-defined chord
   */
  async deleteUserChord(e, o) {
    try {
      const r = await this.openDB(), n = `${e}:${o}`;
      return new Promise((s, t) => {
        const a = r.transaction([c], "readwrite").objectStore(c).delete(n);
        a.onsuccess = () => {
          s();
        }, a.onerror = () => {
          t(new Error(`Failed to delete user chord: ${a.error}`));
        };
      });
    } catch (r) {
      throw console.error("IndexedDB error:", r), r;
    }
  }
  /**
   * Get all user-defined chords for an instrument
   */
  async getUserChordsByInstrument(e) {
    try {
      const o = await this.openDB();
      return new Promise((r, n) => {
        const u = o.transaction([c], "readonly").objectStore(c).index("instrument").getAll(e);
        u.onsuccess = () => {
          r(u.result || []);
        }, u.onerror = () => {
          n(new Error(`Failed to get user chords: ${u.error}`));
        };
      });
    } catch (o) {
      return console.error("IndexedDB error:", o), [];
    }
  }
  /**
   * Get all user-defined chords
   */
  async getAllUserChords() {
    try {
      const e = await this.openDB();
      return new Promise((o, r) => {
        const t = e.transaction([c], "readonly").objectStore(c).getAll();
        t.onsuccess = () => {
          o(t.result || []);
        }, t.onerror = () => {
          r(new Error(`Failed to get all user chords: ${t.error}`));
        };
      });
    } catch (e) {
      return console.error("IndexedDB error:", e), [];
    }
  }
  /**
   * Clear all user-defined chords
   */
  async clearUserChords() {
    try {
      const e = await this.openDB();
      return new Promise((o, r) => {
        const t = e.transaction([c], "readwrite").objectStore(c).clear();
        t.onsuccess = () => {
          o();
        }, t.onerror = () => {
          r(new Error(`Failed to clear user chords: ${t.error}`));
        };
      });
    } catch (e) {
      throw console.error("IndexedDB error:", e), e;
    }
  }
}
const S = new h();
export {
  S as indexedDBService
};

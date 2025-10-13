import { indexedDBService as t } from "./indexed-db-service.js";
import { systemDefaultChords as c } from "./default-chords.js";
class i {
  constructor() {
    this.useRemoteAPI = !1, this.apiEndpoint = "";
  }
  /**
   * Configure the service to use a remote API endpoint
   */
  configureAPI(a) {
    this.apiEndpoint = a, this.useRemoteAPI = !0;
  }
  /**
   * Disable remote API and use local data
   */
  disableAPI() {
    this.useRemoteAPI = !1;
  }
  /**
   * Get chord data for a specific instrument
   * This method implements the fallback chain: IndexedDB -> API -> Local
   */
  async getChordData(a) {
    try {
      const e = await t.getChordData(a);
      if (e && e.chords)
        return console.log(`[ChordDataService] Loaded ${a} from IndexedDB cache`), {
          data: e.chords,
          source: { type: "indexeddb", timestamp: e.timestamp }
        };
    } catch (e) {
      console.warn("[ChordDataService] IndexedDB error, falling back:", e);
    }
    if (this.useRemoteAPI && this.apiEndpoint)
      try {
        const e = await this.fetchFromAPI(a);
        if (e)
          return console.log(`[ChordDataService] Loaded ${a} from remote API`), await this.cacheChordData(a, e), {
            data: e,
            source: { type: "api", timestamp: Date.now() }
          };
      } catch (e) {
        console.warn("[ChordDataService] API fetch error, falling back to local:", e);
      }
    console.log(`[ChordDataService] Loaded ${a} from local defaults`);
    const r = c[a] || {};
    return await this.cacheChordData(a, r), {
      data: r,
      source: { type: "local", timestamp: Date.now() }
    };
  }
  /**
   * Fetch chord data from remote API
   * This is a placeholder that can be implemented when API is ready
   */
  async fetchFromAPI(a) {
    if (!this.apiEndpoint)
      return null;
    try {
      const r = `${this.apiEndpoint}?instrument=${encodeURIComponent(a)}`, e = await fetch(r);
      if (!e.ok)
        throw new Error(`API request failed: ${e.status} ${e.statusText}`);
      const s = await e.json();
      return s.chords || s;
    } catch (r) {
      return console.error("[ChordDataService] API fetch error:", r), null;
    }
  }
  /**
   * Cache chord data in IndexedDB
   */
  async cacheChordData(a, r) {
    try {
      await t.setChordData(a, r), console.log(`[ChordDataService] Cached ${a} in IndexedDB`);
    } catch (e) {
      console.warn("[ChordDataService] Failed to cache in IndexedDB:", e);
    }
  }
  /**
   * Get all available instruments from local defaults
   * In the future, this could also query the API
   */
  getAvailableInstruments() {
    return Object.keys(c);
  }
  /**
   * Clear all cached data from IndexedDB
   */
  async clearCache() {
    await t.clearAll(), console.log("[ChordDataService] Cache cleared");
  }
  /**
   * Force refresh data from source (API or local) and update cache
   */
  async refreshData(a) {
    if (this.useRemoteAPI && this.apiEndpoint)
      try {
        const e = await this.fetchFromAPI(a);
        if (e)
          return await this.cacheChordData(a, e), {
            data: e,
            source: { type: "api", timestamp: Date.now() }
          };
      } catch (e) {
        console.warn("[ChordDataService] Refresh from API failed:", e);
      }
    const r = c[a] || {};
    return await this.cacheChordData(a, r), {
      data: r,
      source: { type: "local", timestamp: Date.now() }
    };
  }
  /**
   * Check if a specific chord exists for an instrument
   */
  async hasChord(a, r) {
    const e = await this.getChordData(a);
    return r in e.data;
  }
  /**
   * Get data for a specific chord
   * @param instrument - The instrument name
   * @param chordName - The chord name
   * @param preferUser - If true, returns user override if it exists; if false, returns system default only
   */
  async getChord(a, r, e = !0) {
    if (e)
      try {
        const o = await t.getUserChord(a, r);
        if (o)
          return {
            fingers: o.fingers,
            barres: o.barres,
            position: o.position
          };
      } catch (o) {
        console.warn("[ChordDataService] Failed to get user chord:", o);
      }
    return (await this.getChordData(a)).data[r] || null;
  }
  /**
   * Save a user-defined chord override
   */
  async saveUserChord(a, r, e) {
    await t.saveUserChord(a, r, e), console.log(`[ChordDataService] Saved user chord: ${a} - ${r}`);
  }
  /**
   * Delete a user-defined chord override (revert to system default)
   */
  async deleteUserChord(a, r) {
    await t.deleteUserChord(a, r), console.log(`[ChordDataService] Deleted user chord: ${a} - ${r}`);
  }
  /**
   * Get all user-defined chords for an instrument
   */
  async getUserChordsByInstrument(a) {
    return (await t.getUserChordsByInstrument(a)).map((e) => ({
      chordName: e.chordName,
      data: {
        fingers: e.fingers,
        barres: e.barres,
        position: e.position
      }
    }));
  }
  /**
   * Get all user-defined chords across all instruments
   */
  async getAllUserChords() {
    return (await t.getAllUserChords()).map((r) => ({
      instrument: r.instrument,
      chordName: r.chordName,
      data: {
        fingers: r.fingers,
        barres: r.barres,
        position: r.position
      }
    }));
  }
  /**
   * Clear all user-defined chord overrides
   */
  async clearUserChords() {
    await t.clearUserChords(), console.log("[ChordDataService] Cleared all user chords");
  }
}
const l = new i();
export {
  l as chordDataService
};

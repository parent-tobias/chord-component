/**
 * Chord Data Service
 *
 * This service provides a unified interface for accessing chord data.
 * It implements a caching strategy using IndexedDB:
 * 1. First checks IndexedDB for cached data
 * 2. Falls back to local default chord data if not found
 * 3. Caches the data in IndexedDB for future use
 * 4. Can be easily extended to fetch from a remote API
 */

import { indexedDBService } from './indexed-db-service.js';
import { systemDefaultChords, type InstrumentDefault } from './default-chords.js';

export interface ChordDataSource {
  type: 'indexeddb' | 'local' | 'api';
  timestamp?: number;
}

export interface ChordDataResult {
  data: Record<string, InstrumentDefault>;
  source: ChordDataSource;
}

class ChordDataService {
  private useRemoteAPI: boolean = false;
  private apiEndpoint: string = '';

  /**
   * Configure the service to use a remote API endpoint
   */
  configureAPI(endpoint: string) {
    this.apiEndpoint = endpoint;
    this.useRemoteAPI = true;
  }

  /**
   * Disable remote API and use local data
   */
  disableAPI() {
    this.useRemoteAPI = false;
  }

  /**
   * Get chord data for a specific instrument
   * This method implements the fallback chain: IndexedDB -> API -> Local
   */
  async getChordData(instrument: string): Promise<ChordDataResult> {
    // Step 1: Try to get from IndexedDB cache
    try {
      const cachedData = await indexedDBService.getChordData(instrument);

      if (cachedData && cachedData.chords) {
        console.log(`[ChordDataService] Loaded ${instrument} from IndexedDB cache`);
        return {
          data: cachedData.chords,
          source: { type: 'indexeddb', timestamp: cachedData.timestamp }
        };
      }
    } catch (error) {
      console.warn('[ChordDataService] IndexedDB error, falling back:', error);
    }

    // Step 2: Try to fetch from remote API if configured
    if (this.useRemoteAPI && this.apiEndpoint) {
      try {
        const apiData = await this.fetchFromAPI(instrument);

        if (apiData) {
          console.log(`[ChordDataService] Loaded ${instrument} from remote API`);

          // Cache the API data in IndexedDB for future use
          await this.cacheChordData(instrument, apiData);

          return {
            data: apiData,
            source: { type: 'api', timestamp: Date.now() }
          };
        }
      } catch (error) {
        console.warn('[ChordDataService] API fetch error, falling back to local:', error);
      }
    }

    // Step 3: Fall back to local default data
    console.log(`[ChordDataService] Loaded ${instrument} from local defaults`);
    const localData = systemDefaultChords[instrument] || {};

    // Cache the local data in IndexedDB for future use
    await this.cacheChordData(instrument, localData);

    return {
      data: localData,
      source: { type: 'local', timestamp: Date.now() }
    };
  }

  /**
   * Fetch chord data from remote API
   * This is a placeholder that can be implemented when API is ready
   */
  private async fetchFromAPI(instrument: string): Promise<Record<string, InstrumentDefault> | null> {
    if (!this.apiEndpoint) {
      return null;
    }

    try {
      const url = `${this.apiEndpoint}?instrument=${encodeURIComponent(instrument)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.chords || data; // Flexible response format
    } catch (error) {
      console.error('[ChordDataService] API fetch error:', error);
      return null;
    }
  }

  /**
   * Cache chord data in IndexedDB
   */
  private async cacheChordData(instrument: string, chords: Record<string, InstrumentDefault>): Promise<void> {
    try {
      await indexedDBService.setChordData(instrument, chords);
      console.log(`[ChordDataService] Cached ${instrument} in IndexedDB`);
    } catch (error) {
      console.warn('[ChordDataService] Failed to cache in IndexedDB:', error);
    }
  }

  /**
   * Get all available instruments from local defaults
   * In the future, this could also query the API
   */
  getAvailableInstruments(): string[] {
    return Object.keys(systemDefaultChords);
  }

  /**
   * Clear all cached data from IndexedDB
   */
  async clearCache(): Promise<void> {
    await indexedDBService.clearAll();
    console.log('[ChordDataService] Cache cleared');
  }

  /**
   * Force refresh data from source (API or local) and update cache
   */
  async refreshData(instrument: string): Promise<ChordDataResult> {
    // If using API, fetch fresh data
    if (this.useRemoteAPI && this.apiEndpoint) {
      try {
        const apiData = await this.fetchFromAPI(instrument);

        if (apiData) {
          await this.cacheChordData(instrument, apiData);
          return {
            data: apiData,
            source: { type: 'api', timestamp: Date.now() }
          };
        }
      } catch (error) {
        console.warn('[ChordDataService] Refresh from API failed:', error);
      }
    }

    // Fall back to local data
    const localData = systemDefaultChords[instrument] || {};
    await this.cacheChordData(instrument, localData);

    return {
      data: localData,
      source: { type: 'local', timestamp: Date.now() }
    };
  }

  /**
   * Check if a specific chord exists for an instrument
   */
  async hasChord(instrument: string, chordName: string): Promise<boolean> {
    const result = await this.getChordData(instrument);
    return chordName in result.data;
  }

  /**
   * Get data for a specific chord
   * @param instrument - The instrument name
   * @param chordName - The chord name
   * @param preferUser - If true, returns user override if it exists; if false, returns system default only
   */
  async getChord(instrument: string, chordName: string, preferUser: boolean = true): Promise<InstrumentDefault | null> {
    // Check for user override first if preferUser is true
    if (preferUser) {
      try {
        const userChord = await indexedDBService.getUserChord(instrument, chordName);
        if (userChord) {
          return {
            fingers: userChord.fingers,
            barres: userChord.barres,
            position: userChord.position
          };
        }
      } catch (error) {
        console.warn('[ChordDataService] Failed to get user chord:', error);
      }
    }

    // Fall back to system default
    const result = await this.getChordData(instrument);
    return result.data[chordName] || null;
  }

  /**
   * Save a user-defined chord override
   */
  async saveUserChord(instrument: string, chordName: string, chordData: InstrumentDefault): Promise<void> {
    await indexedDBService.saveUserChord(instrument, chordName, chordData);
    console.log(`[ChordDataService] Saved user chord: ${instrument} - ${chordName}`);
  }

  /**
   * Delete a user-defined chord override (revert to system default)
   */
  async deleteUserChord(instrument: string, chordName: string): Promise<void> {
    await indexedDBService.deleteUserChord(instrument, chordName);
    console.log(`[ChordDataService] Deleted user chord: ${instrument} - ${chordName}`);
  }

  /**
   * Get all user-defined chords for an instrument
   */
  async getUserChordsByInstrument(instrument: string): Promise<Array<{ chordName: string, data: InstrumentDefault }>> {
    const userChords = await indexedDBService.getUserChordsByInstrument(instrument);
    return userChords.map(chord => ({
      chordName: chord.chordName,
      data: {
        fingers: chord.fingers,
        barres: chord.barres,
        position: chord.position
      }
    }));
  }

  /**
   * Get all user-defined chords across all instruments
   */
  async getAllUserChords(): Promise<Array<{ instrument: string, chordName: string, data: InstrumentDefault }>> {
    const userChords = await indexedDBService.getAllUserChords();
    return userChords.map(chord => ({
      instrument: chord.instrument,
      chordName: chord.chordName,
      data: {
        fingers: chord.fingers,
        barres: chord.barres,
        position: chord.position
      }
    }));
  }

  /**
   * Clear all user-defined chord overrides
   */
  async clearUserChords(): Promise<void> {
    await indexedDBService.clearUserChords();
    console.log('[ChordDataService] Cleared all user chords');
  }
}

// Export a singleton instance
export const chordDataService = new ChordDataService();

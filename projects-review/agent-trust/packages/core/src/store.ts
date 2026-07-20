import type { DID, TransactionRecord } from './types.js';

/**
 * In-memory store — sufficient for MVP / local development.
 * Replace with a PostgreSQL adapter (see store.pg.ts) for production.
 */
const store = new Map<DID, TransactionRecord[]>();

export const transactionStore = {
  /** Persist a transaction record for a provider agent */
  add(record: TransactionRecord): void {
    const existing = store.get(record.providerDid) ?? [];
    existing.push(record);
    store.set(record.providerDid, existing);
  },

  /** Retrieve all records for an agent (returns empty array if unknown) */
  getByDid(did: DID): TransactionRecord[] {
    return store.get(did) ?? [];
  },

  /** Return all known agent DIDs */
  allDids(): DID[] {
    return Array.from(store.keys());
  },

  /** Seed with records — useful for tests and demos */
  seed(records: TransactionRecord[]): void {
    for (const r of records) {
      this.add(r);
    }
  },

  /** Wipe the store — tests only */
  _reset(): void {
    store.clear();
  },

  stats(): { agentCount: number; transactionCount: number } {
    let txCount = 0;
    for (const records of store.values()) txCount += records.length;
    return { agentCount: store.size, transactionCount: txCount };
  },
};

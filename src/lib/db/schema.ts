import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

/**
 * All addresses stored lowercased — comparisons and lookups throughout this
 * schema assume that normalization, since Ethereum addresses are
 * case-insensitive but checksummed display differs by casing.
 */

export const usernames = pgTable("usernames", {
  address: text("address").primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const follows = pgTable(
  "follows",
  {
    followerAddress: text("follower_address").notNull(),
    followeeAddress: text("followee_address").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.followerAddress, table.followeeAddress] })],
);

/**
 * SIWE sign-in nonces, tracked server-side so each one can only be
 * consumed once — a signed cookie alone can't guarantee that (a captured
 * message+signature+nonce could otherwise be replayed to mint new
 * sessions indefinitely within the nonce's TTL). Consumed via an atomic
 * DELETE...RETURNING in the verify route, not a separate read-then-delete,
 * so two concurrent verify attempts with the same nonce can't both win.
 */
export const siweNonces = pgTable("siwe_nonces", {
  nonce: text("nonce").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

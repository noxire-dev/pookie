import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    salt: v.string(),
    passwordHash: v.string(),
    memberCount: v.number(),
    createdAt: v.number(),
  }).index('by_code', ['code']),

  moods: defineTable({
    roomCode: v.string(),
    encryptedData: v.string(),
    iv: v.string(),
    createdAt: v.number(),
  }).index('by_room', ['roomCode', 'createdAt']),

  nudges: defineTable({
    roomCode: v.string(),
    from: v.string(),
    createdAt: v.number(),
  }).index('by_room', ['roomCode', 'createdAt']),

  presence: defineTable({
    roomCode: v.string(),
    role: v.string(),
    lastSeen: v.number(),
  }).index('by_room_role', ['roomCode', 'role']),
});

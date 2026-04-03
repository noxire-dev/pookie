import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const heartbeat = mutation({
  args: {
    roomCode: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_room_role', (q) =>
        q.eq('roomCode', args.roomCode).eq('role', args.role),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
    } else {
      await ctx.db.insert('presence', {
        roomCode: args.roomCode,
        role: args.role,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getPresence = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query('presence')
      .withIndex('by_room_role', (q) => q.eq('roomCode', args.roomCode))
      .collect();
    return records;
  },
});

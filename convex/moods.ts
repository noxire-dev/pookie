import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const logMood = mutation({
  args: {
    roomCode: v.string(),
    encryptedData: v.string(),
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('moods', {
      roomCode: args.roomCode,
      encryptedData: args.encryptedData,
      iv: args.iv,
      createdAt: Date.now(),
    });
  },
});

export const listMoods = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('moods')
      .withIndex('by_room', (q) => q.eq('roomCode', args.roomCode))
      .order('desc')
      .take(50);
  },
});

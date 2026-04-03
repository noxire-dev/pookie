import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const sendNudge = mutation({
  args: {
    roomCode: v.string(),
    from: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('nudges', {
      roomCode: args.roomCode,
      from: args.from,
      createdAt: Date.now(),
    });
  },
});

export const latestNudge = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('nudges')
      .withIndex('by_room', (q) => q.eq('roomCode', args.roomCode))
      .order('desc')
      .first();
  },
});

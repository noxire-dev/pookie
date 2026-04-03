import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createRoom = mutation({
  args: {
    salt: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a unique room code
    let code: string;
    let attempts = 0;
    do {
      code = generateCode();
      const existing = await ctx.db
        .query('rooms')
        .withIndex('by_code', (q) => q.eq('code', code))
        .first();
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    await ctx.db.insert('rooms', {
      code,
      salt: args.salt,
      passwordHash: args.passwordHash,
      memberCount: 1,
      createdAt: Date.now(),
    });

    return { code };
  },
});

export const getRoom = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('rooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
  },
});

export const confirmJoin = mutation({
  args: { code: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
    if (!room) throw new Error('Room not found');
    if (room.passwordHash !== args.passwordHash) throw new Error('Wrong password');

    // Allow rejoin if password matches (don't increment if already full)
    if (room.memberCount < 2) {
      await ctx.db.patch(room._id, { memberCount: room.memberCount + 1 });
    }
    return { salt: room.salt };
  },
});

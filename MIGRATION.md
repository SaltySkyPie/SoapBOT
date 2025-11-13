# Migration Guide: Discord.js v13 → v14 & MySQL → Prisma

This document outlines the changes made to upgrade the SoapBOT repository.

## ✅ Completed Changes

### 1. Package Dependencies
- ✅ Upgraded `discord.js` from v13.6.0 to v14.16.3
- ✅ Added `@prisma/client` v6.1.0 and `prisma` v6.1.0
- ✅ Removed legacy dependencies: `promise-mysql`, `mysql2`, `@discordjs/rest`, `discord-api-types`
- ✅ Updated TypeScript to v5.7.2
- ✅ Updated Node types to v22.10.1

### 2. Node.js Version
- ✅ Created `.nvmrc` file specifying Node.js v22 (latest LTS)
- ✅ Current environment is already running Node.js v22.21.1

### 3. Prisma Setup
- ✅ Initialized Prisma with MySQL provider
- ✅ Created comprehensive Prisma schema with all models:
  - User, Item, Inventory, Command, Ban, Love
  - ActiveItem, CommandCooldown, Gif, KillMessage
- ✅ Generated Prisma Client at `src/generated/prisma`
- ✅ Created Prisma client instance at `src/lib/prisma.ts`

### 4. Database Migration (Functions)
All helper functions have been migrated to Prisma:
- ✅ `getUserData.ts`
- ✅ `getPoints.ts` / `setPoints.ts`
- ✅ `getBank.ts` / `setBank.ts`
- ✅ `checkUserCreation.ts`
- ✅ `checkBan.ts`
- ✅ `checkCooldown.ts` / `putOnCooldown.ts`
- ✅ `getSoapStatus.ts` / `setSoapStatus.ts`
- ✅ `getItemByName.ts`
- ✅ `updateTag.ts` / `updateAvatar.ts`
- ✅ `addItem.ts` / `setItemAmount.ts`
- ✅ `addActiveItem.ts` / `checkActiveItem.ts` / `removeActiveItem.ts`

### 5. Handler Files
- ✅ Updated `handlers/command_handler.ts` to use Prisma
- ✅ Updated `handlers/item_handler.ts` to use Prisma

### 6. Event Files
- ✅ Updated `events/interactionCreate.ts` to use Prisma and Discord.js v14
- ✅ Updated `events/ready.ts` for Discord.js v14 (PresenceUpdateStatus, ActivityType)

### 7. Core Bot Files
- ✅ Updated `bot.ts`: Changed `Intents.FLAGS` to `GatewayIntentBits`
- ✅ Updated `index.ts`: ShardingManager remains compatible

### 8. Discord.js v14 Changes Applied
- ✅ `MessageEmbed` → `EmbedBuilder` (all command files)
- ✅ `MessageAttachment` → `AttachmentBuilder` (ship.ts)
- ✅ `AttachmentBuilder` constructor now uses options object
- ✅ `displayAvatarURL({ dynamic: true })` → `displayAvatarURL()`
- ✅ `Intents.FLAGS` → `GatewayIntentBits`
- ✅ `PresenceStatusData` → `PresenceUpdateStatus`
- ✅ Added `ActivityType` to presence updates

## ⚠️ Remaining Work

### 1. Commands with Direct SQL Calls
The following command files still contain raw SQL queries that need to be converted to Prisma:
- `commands/ship.ts` - Love table queries
- `commands/use.ts` - Inventory and items queries
- `commands/stats.ts` - Aggregation queries
- `commands/shop.ts` - Item queries
- `commands/leaderboard.ts` - Complex ranking query
- `commands/kill.ts` - Random message query
- `commands/drop.ts` - Complex drop logic with GIF queries
- `commands/buy.ts` - Item purchase logic
- `commands/inventory.ts` - Inventory pagination
- `commands/help.ts` - Command listing
- `commands/daily.ts` - Daily rewards
- `commands/coinflip.ts` - Game logic
- `commands/balance.ts` - Balance display
- `commands/give.ts` - Point transfers
- `commands/rob.ts` - Rob mechanics
- `commands/beg.ts` - Beg mechanics
- `commands/vote.ts` - Voting rewards
- `commands/community.ts` - Community info
- `commands/website.ts` - Website info

### 2. Items with Direct SQL Calls
- `items/soap stasher.ts`
- `items/soap party.ts`
- `items/fight club soap.ts`
- `items/soap hardener.ts`
- `items/rope.ts`

### 3. Discord.js v14 Component Updates Needed
Several commands use old Discord.js v13 components that need updating:
- `MessageActionRow` → `ActionRowBuilder<ButtonBuilder>`
- `MessageButton` → `ButtonBuilder`
- `button.setStyle('PRIMARY')` → `button.setStyle(ButtonStyle.Primary)`
- `.addChoice()` → `.addChoices()`

Files affected:
- `commands/drop.ts`
- `commands/help.ts`
- `commands/inventory.ts`
- `commands/shop.ts` (likely)

### 4. Type Issues to Fix
- BigInt arithmetic operations need explicit conversion
- Null safety checks for user data from Prisma
- SlashCommandOptionsOnlyBuilder type compatibility

### 5. Missing Database Schema Fields
The Prisma schema has been updated with:
- `buy_cost`, `sell_cost`, `use_timer` for Item model
- `cooldown` for Command model

**Important:** You need to run database migrations to add these fields to your existing MySQL database.

### 6. Environment Configuration
Update your `.env` file with actual database credentials:
```env
TOKEN=your_actual_discord_bot_token
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SCHEMA=your_db_name
DATABASE_URL="mysql://your_db_user:your_db_password@your_db_host:3306/your_db_name"
```

## 📝 Next Steps

1. **Update Database Schema**
   ```bash
   npx prisma db push
   # or create a migration
   npx prisma migrate dev --name add_missing_fields
   ```

2. **Complete Command Migration**
   - Update remaining commands to use Prisma instead of SQL
   - Update Discord.js v14 components (ActionRowBuilder, ButtonBuilder)
   - Fix type issues with BigInt operations

3. **Test Thoroughly**
   - Test all commands
   - Verify database operations
   - Check Discord interactions

4. **Remove Legacy Code**
   - Delete `src/functions/SQL.ts` once all migrations are complete
   - Remove unused dependencies from package.json if any

## 🔧 Migration Pattern

### SQL to Prisma Examples

**Before (SQL):**
```typescript
const users = await SQL("SELECT * FROM users WHERE user_id=?", [userId]);
const user = users[0];
```

**After (Prisma):**
```typescript
const user = await prisma.user.findUnique({
  where: { user_id: userId },
});
```

**Before (SQL):**
```typescript
await SQL("UPDATE users SET points=? WHERE user_id=?", [points, userId]);
```

**After (Prisma):**
```typescript
await prisma.user.update({
  where: { user_id: userId },
  data: { points },
});
```

### Discord.js v13 → v14 Examples

**Before (v13):**
```typescript
const row = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('button_id')
      .setLabel('Click Me')
      .setStyle('PRIMARY')
  );
```

**After (v14):**
```typescript
const row = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('button_id')
      .setLabel('Click Me')
      .setStyle(ButtonStyle.Primary)
  );
```

## 📚 Resources

- [Discord.js v14 Guide](https://discordjs.guide/)
- [Discord.js v13 → v14 Migration](https://discordjs.guide/additional-info/changes-in-v14.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

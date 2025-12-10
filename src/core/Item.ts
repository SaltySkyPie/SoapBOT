import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import type SoapClient from "./SoapClient.js";

/**
 * Base class for all items in the bot.
 * Subclasses define item properties that get synced to the database on startup.
 */
export default abstract class Item {
  /** Unique item name (used as DB identifier) */
  abstract readonly name: string;

  /** Item description shown in shop and inventory */
  abstract readonly description: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // Shop & Economy Properties
  // ═══════════════════════════════════════════════════════════════════════════

  /** Whether the item can be purchased from the shop */
  readonly buyable: boolean = false;

  /** Whether the item can be sold back to the shop */
  readonly sellable: boolean = false;

  /** Whether the item appears in /shop listing */
  readonly shop: boolean = false;

  /** Cost to buy from shop (in soap) */
  readonly buyCost: number = 0;

  /** Price when selling to shop (in soap) */
  readonly sellCost: number = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // Usage Properties
  // ═══════════════════════════════════════════════════════════════════════════

  /** Whether the item can be used via /use command */
  readonly useable: boolean = false;

  /** Whether multiple of this item can be used at once (e.g., "use soap party 5") */
  readonly multipleUsable: boolean = false;

  /** Whether the item can be used on another player (requires target user) */
  readonly targetable: boolean = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // Active Effect Properties
  // ═══════════════════════════════════════════════════════════════════════════

  /** Whether the item becomes "active" for a duration when used (stored in active_items table) */
  readonly activable: boolean = false;

  /** Duration in seconds the item stays active (only applies if activable=true) */
  readonly activeDuration: number = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // Internal Properties (set by DB)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Database ID - automatically set after upsert, do not set manually */
  id: number = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // Abstract Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute the item's effect when used.
   * @param client - The Discord client instance
   * @param interaction - The command interaction
   * @param amount - Number of items being used at once
   * @returns true if the item should be consumed, false otherwise
   */
  abstract execute(
    client: SoapClient,
    interaction: ChatInputCommandInteraction,
    amount: number
  ): Promise<boolean>;

  // ═══════════════════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════════════════

  protected getMember(interaction: ChatInputCommandInteraction): GuildMember {
    return interaction.member as GuildMember;
  }

  protected getTargetMember(
    interaction: ChatInputCommandInteraction,
    optionName = "user"
  ): GuildMember | null {
    return interaction.options.getMember(optionName) as GuildMember | null;
  }
}

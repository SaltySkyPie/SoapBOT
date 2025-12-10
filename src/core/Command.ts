import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type SoapClient from "./SoapClient.js";

export const SOAP_COLOR = "#ff00e4" as const;

type SlashCommandResult =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

/**
 * Base class for all bot commands.
 * Subclasses define command properties that get synced to the database on startup.
 */
export default abstract class Command {
  /** Unique command name (used as slash command name and DB identifier) */
  abstract readonly name: string;

  /** Command description shown in Discord's slash command menu */
  abstract readonly description: string;

  /** Cooldown in seconds between uses of this command (0 = no cooldown) */
  readonly cooldown: number = 0;

  /** Database ID - automatically set after upsert, do not set manually */
  id: number = 0;

  /**
   * Execute the command.
   * @param client - The Discord client instance
   * @param interaction - The slash command interaction
   * @returns true if cooldown should be applied, false otherwise
   */
  abstract execute(client: SoapClient, interaction: ChatInputCommandInteraction): Promise<boolean>;

  /**
   * Build the slash command definition for Discord API registration.
   * @returns The SlashCommandBuilder with options configured
   */
  abstract getSlash(): Promise<SlashCommandResult>;

  // ═══════════════════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /** Create a new embed with the bot's theme color */
  protected createEmbed(): EmbedBuilder {
    return new EmbedBuilder().setColor(SOAP_COLOR);
  }

  /** Get the guild member who triggered the interaction */
  protected getMember(interaction: ChatInputCommandInteraction): GuildMember {
    return interaction.member as GuildMember;
  }

  /** Get a target member from command options */
  protected getTargetMember(
    interaction: ChatInputCommandInteraction,
    optionName = "user"
  ): GuildMember | null {
    return interaction.options.getMember(optionName) as GuildMember | null;
  }
}

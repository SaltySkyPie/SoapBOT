import { CommandInteraction, EmbedBuilder, Message, ComponentType } from "discord.js";
import { createNavigationButtons } from "./buttons.js";

export interface PaginationOptions<T> {
  interaction: CommandInteraction;
  fetchItems: (page: number) => Promise<T[]>;
  totalCount: number;
  pageSize: number;
  buildEmbed: (items: T[], currentPage: number, maxPage: number) => EmbedBuilder;
  customIdPrefix: string;
  idleTimeout?: number;
}

export async function createPaginatedEmbed<T>(options: PaginationOptions<T>): Promise<boolean> {
  const {
    interaction,
    fetchItems,
    totalCount,
    pageSize,
    buildEmbed,
    customIdPrefix,
    idleTimeout = 20000,
  } = options;

  let currentPage = 0;
  const maxPage = Math.max(0, Math.ceil(totalCount / pageSize) - 1);

  const items = await fetchItems(currentPage);
  const embed = buildEmbed(items, currentPage, maxPage);
  const row = createNavigationButtons(customIdPrefix, interaction.id);

  const reply = (await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true,
  })) as Message;

  const collector = interaction.channel!.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: idleTimeout,
  });

  collector.on("collect", async (buttonInteraction) => {
    if (!buttonInteraction.customId.includes(interaction.id)) return;

    if (buttonInteraction.user.id !== interaction.user.id) {
      await buttonInteraction.reply({ content: "These buttons aren't for you!", ephemeral: true });
      return;
    }

    if (buttonInteraction.customId === `${customIdPrefix}_next${interaction.id}`) {
      currentPage = Math.min(currentPage + 1, maxPage);
    } else if (buttonInteraction.customId === `${customIdPrefix}_previous${interaction.id}`) {
      currentPage = Math.max(currentPage - 1, 0);
    }

    const newItems = await fetchItems(currentPage);
    const newEmbed = buildEmbed(newItems, currentPage, maxPage);

    await reply.edit({ embeds: [newEmbed] });
    await buttonInteraction.deferUpdate().catch(() => {});
  });

  collector.on("end", async () => {
    const disabledRow = createNavigationButtons(customIdPrefix, interaction.id, true);
    await reply.edit({ components: [disabledRow] }).catch(() => {});
  });

  return true;
}

export function addPaginatedFields(
  embed: EmbedBuilder,
  items: Array<{ name: string; description: string; value?: string }>,
  inline = true
): EmbedBuilder {
  for (const item of items) {
    embed.addFields(
      { name: "\u200B", value: `**${item.name}**\n`, inline },
      { name: "\u200B", value: `${item.description}\n`, inline },
      { name: "\u200B", value: item.value ?? "-\n", inline }
    );
  }
  return embed;
}

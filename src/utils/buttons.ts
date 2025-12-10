import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createNavigationButtons(
  customIdPrefix: string,
  interactionId: string,
  disabled = false
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_previous${interactionId}`)
      .setLabel("\u25C0")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`${customIdPrefix}_next${interactionId}`)
      .setLabel("\u25B6")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
}

export function createActionButton(
  customId: string,
  label: string,
  style: ButtonStyle = ButtonStyle.Success,
  disabled = false
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style).setDisabled(disabled)
  );
}

export function disableButtons(
  row: ActionRowBuilder<ButtonBuilder>
): ActionRowBuilder<ButtonBuilder> {
  const newRow = new ActionRowBuilder<ButtonBuilder>();
  for (const component of row.components) {
    newRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
  }
  return newRow;
}

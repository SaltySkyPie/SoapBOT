import { EmbedBuilder } from "discord.js";

export const SOAP_COLOR = "#ff00e4" as const;
export const SOAP_ICON = "https://cdn.saltyskypie.com/soapbot/images/soap.png";

export function createSoapEmbed(): EmbedBuilder {
  return new EmbedBuilder().setColor(SOAP_COLOR);
}

export function createTitledEmbed(title: string, description?: string): EmbedBuilder {
  const embed = createSoapEmbed().setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}

export function createAuthoredEmbed(authorName: string, authorIcon?: string): EmbedBuilder {
  return createSoapEmbed().setAuthor({
    name: authorName,
    iconURL: authorIcon ?? SOAP_ICON,
  });
}

export function formatSoap(amount: number, bold = true): string {
  const formatted = amount.toLocaleString();
  return bold ? `**${formatted}**` : formatted;
}

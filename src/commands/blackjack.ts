import {
  ChatInputCommandInteraction,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient, SOAP_COLOR } from "../core/index.js";
import getPoints from "../functions/getPoints.js";
import parseAmount from "../functions/parseAmount.js";
import setPoints from "../functions/setPoints.js";
import getSoapStatus from "../functions/getSoapStatus.js";

// ═══════════════════════════════════════════════════════════════════════════
// Card Types & Constants
// ═══════════════════════════════════════════════════════════════════════════

interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

interface Hand {
  cards: Card[];
  bet: number;
  stood: boolean;
  busted: boolean;
  doubled: boolean;
}

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

// Card display with larger visual
const CARD_BACK = "🂠";

// ═══════════════════════════════════════════════════════════════════════════
// Card Utilities
// ═══════════════════════════════════════════════════════════════════════════

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let numericValue: number;
      if (value === "A") {
        numericValue = 11;
      } else if (["J", "Q", "K"].includes(value)) {
        numericValue = 10;
      } else {
        numericValue = parseInt(value);
      }
      deck.push({ suit, value, numericValue });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateHandValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.value === "A") {
      aces++;
      total += 11;
    } else {
      total += card.numericValue;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function isSoftHand(cards: Card[]): boolean {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.value === "A") {
      aces++;
      total += 11;
    } else {
      total += card.numericValue;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return aces > 0 && total <= 21;
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandValue(cards) === 21;
}

function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  // Can split if both cards have same value (including 10-value cards)
  const val1 = cards[0].value === "A" ? 11 : cards[0].numericValue;
  const val2 = cards[1].value === "A" ? 11 : cards[1].numericValue;
  return val1 === val2;
}

// ═══════════════════════════════════════════════════════════════════════════
// Display Formatting
// ═══════════════════════════════════════════════════════════════════════════

function formatCard(card: Card): string {
  return `**${card.value}**${card.suit}`;
}

function formatCards(cards: Card[]): string {
  return cards.map(formatCard).join("  ");
}

function formatHiddenDealerHand(cards: Card[]): string {
  return `${CARD_BACK}  ${formatCard(cards[1])}`;
}

function getValueString(cards: Card[], isDealer = false, hideHole = false): string {
  if (hideHole && isDealer && cards.length >= 2) {
    const visibleValue = cards[1].value === "A" ? 11 : cards[1].numericValue;
    return `**${visibleValue}** + ?`;
  }

  const value = calculateHandValue(cards);

  if (isBlackjack(cards)) {
    return "**21** — BLACKJACK! 🃏";
  }
  if (value > 21) {
    return `**${value}** — BUST! 💥`;
  }
  if (isSoftHand(cards)) {
    return `**Soft ${value}**`;
  }
  return `**${value}**`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Command
// ═══════════════════════════════════════════════════════════════════════════

export default class Blackjack extends Command {
  readonly name = "blackjack";
  readonly description = "Play a game of blackjack against the dealer";
  readonly cooldown = 15;

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const betInput = interaction.options.getString("bet");

    // Validations
    if ((await getSoapStatus(member.id)) !== 0) {
      interaction.reply({
        content: "You need to pick up your soap first... 😏",
        flags: MessageFlags.Ephemeral,
      });
      return false;
    }

    const points = await getPoints(member.id);
    const bet = parseAmount(betInput, points);

    if (bet === null || bet <= 0) {
      interaction.reply({
        content: "I can only slip on positive numbers...",
        flags: MessageFlags.Ephemeral,
      });
      return false;
    }

    if (bet > points) {
      interaction.reply({
        content: "You don't even have that much 🧼...",
        flags: MessageFlags.Ephemeral,
      });
      return false;
    }

    if (bet < 100) {
      interaction.reply({ content: "Minimum bet is 🧼**100**!", flags: MessageFlags.Ephemeral });
      return false;
    }

    // Deduct initial bet
    await setPoints(member.id, points - bet);

    // Initialize game
    const deck = shuffleDeck(createDeck());
    const dealerCards: Card[] = [deck.pop()!, deck.pop()!];
    const hands: Hand[] = [
      {
        cards: [deck.pop()!, deck.pop()!],
        bet: bet,
        stood: false,
        busted: false,
        doubled: false,
      },
    ];
    // Game state object to avoid TypeScript narrowing issues
    type GamePhase = "player" | "dealer" | "finished";
    const gameState: {
      currentHandIndex: number;
      phase: GamePhase;
      resultMessage: string;
      resultColor: `#${string}`;
    } = {
      currentHandIndex: 0,
      phase: "player",
      resultMessage: "",
      resultColor: SOAP_COLOR,
    };

    // Helper to check phase without TypeScript narrowing
    const isPhase = (p: GamePhase): boolean => gameState.phase === p;

    // ═════════════════════════════════════════════════════════════════════════
    // Embed Builder
    // ═════════════════════════════════════════════════════════════════════════

    const buildEmbed = (): EmbedBuilder => {
      const showDealerHole = gameState.phase !== "player";
      const embed = new EmbedBuilder().setColor(gameState.resultColor);

      // Title with game status
      let title = "🎰  BLACKJACK  🎰";
      if (gameState.phase === "finished") {
        title =
          gameState.resultMessage.includes("Won") || gameState.resultMessage.includes("BLACKJACK")
            ? "🎉  BLACKJACK  🎉"
            : gameState.resultMessage.includes("Push")
              ? "🤝  BLACKJACK  🤝"
              : "😢  BLACKJACK  😢";
      }

      embed.setAuthor({
        name: `${title} ${member.displayName}'s Game`,
        iconURL: member.user.displayAvatarURL(),
      });

      // Build description with visual layout
      let desc = "";

      // Dealer section
      desc += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
      desc += "**🎰  DEALER**\n";
      desc += showDealerHole ? formatCards(dealerCards) : formatHiddenDealerHand(dealerCards);
      desc += "\n";
      desc += `Value: ${getValueString(dealerCards, true, !showDealerHole)}\n`;
      desc += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

      // Player hands
      for (let i = 0; i < hands.length; i++) {
        const hand = hands[i];
        const isCurrentHand = i === gameState.currentHandIndex && gameState.phase === "player";
        const handLabel = hands.length > 1 ? ` (Hand ${i + 1})` : "";
        const pointer = isCurrentHand ? "  👈" : "";

        desc += `**🃏  YOUR HAND${handLabel}**${pointer}\n`;
        desc += formatCards(hand.cards) + "\n";
        desc += `Value: ${getValueString(hand.cards)}\n`;

        // Show hand bet if multiple hands or doubled
        if (hands.length > 1 || hand.doubled) {
          desc += `Bet: 🧼 **${hand.bet.toLocaleString()}**`;
          if (hand.doubled) desc += " (Doubled!)";
          desc += "\n";
        }

        if (i < hands.length - 1) desc += "\n";
      }

      desc += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

      // Total bet
      const totalBet = hands.reduce((sum, h) => sum + h.bet, 0);
      desc += `**💰  Total Bet:** 🧼 **${totalBet.toLocaleString()}**`;

      embed.setDescription(desc);

      // Result message as footer or field
      if (gameState.phase === "finished" && gameState.resultMessage) {
        embed.addFields({ name: "Result", value: gameState.resultMessage, inline: false });
      } else if (gameState.phase === "player") {
        const currentHand = hands[gameState.currentHandIndex];
        if (currentHand) {
          let hint = "**HIT** = Draw card  •  **STAND** = End turn";
          if (currentHand.cards.length === 2 && !currentHand.doubled) {
            hint += "\n**DOUBLE** = Double bet, one card  •  ";
            if (canSplit(currentHand.cards) && hands.length < 4) {
              hint += "**SPLIT** = Split pair";
            }
          }
          embed.setFooter({ text: hint });
        }
      }

      return embed;
    };

    // ═════════════════════════════════════════════════════════════════════════
    // Button Builder
    // ═════════════════════════════════════════════════════════════════════════

    const buildButtons = async (): Promise<ActionRowBuilder<ButtonBuilder>> => {
      const currentHand = hands[gameState.currentHandIndex];
      const disabled = gameState.phase !== "player" || !currentHand;
      const isFirstAction = currentHand
        ? currentHand.cards.length === 2 && !currentHand.doubled
        : false;
      const currentPoints = await getPoints(member.id);
      const canAffordDouble = currentHand ? currentPoints >= currentHand.bet : false;
      const canAffordSplit = currentHand ? currentPoints >= currentHand.bet : false;
      const canDoSplit =
        currentHand && canSplit(currentHand.cards) && hands.length < 4 && isFirstAction;

      const row = new ActionRowBuilder<ButtonBuilder>();

      // HIT button
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`bj_hit_${interaction.id}`)
          .setLabel("HIT")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🎯")
          .setDisabled(disabled)
      );

      // STAND button
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`bj_stand_${interaction.id}`)
          .setLabel("STAND")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("✋")
          .setDisabled(disabled)
      );

      // DOUBLE button (only show when valid)
      if (isFirstAction) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`bj_double_${interaction.id}`)
            .setLabel("DOUBLE")
            .setStyle(ButtonStyle.Success)
            .setEmoji("⬆️")
            .setDisabled(disabled || !canAffordDouble)
        );
      }

      // SPLIT button (only show when valid)
      if (canDoSplit) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`bj_split_${interaction.id}`)
            .setLabel("SPLIT")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("✂️")
            .setDisabled(disabled || !canAffordSplit)
        );
      }

      return row;
    };

    // ═════════════════════════════════════════════════════════════════════════
    // Move to Next Hand or Dealer
    // ═════════════════════════════════════════════════════════════════════════

    const advanceGame = (): void => {
      // Find next playable hand
      gameState.currentHandIndex++;
      while (gameState.currentHandIndex < hands.length) {
        const hand = hands[gameState.currentHandIndex];
        if (!hand.stood && !hand.busted) {
          return; // Found a hand to play
        }
        gameState.currentHandIndex++;
      }
      // No more hands, dealer's turn
      gameState.phase = "dealer";
    };

    // ═════════════════════════════════════════════════════════════════════════
    // Utility: Sleep function
    // ═════════════════════════════════════════════════════════════════════════

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // ═════════════════════════════════════════════════════════════════════════
    // Calculate Results
    // ═════════════════════════════════════════════════════════════════════════

    const resolveGame = async (reply: Message): Promise<void> => {
      gameState.phase = "dealer";

      // Animate dealer drawing cards with 1s delay between each
      while (calculateHandValue(dealerCards) < 17) {
        // Update embed to show current dealer state
        const drawEmbed = buildEmbed();
        const drawRow = await buildButtons();
        drawRow.components.forEach((b) => b.setDisabled(true));
        await reply.edit({ embeds: [drawEmbed], components: [drawRow] });

        await sleep(1000);
        dealerCards.push(deck.pop()!);
      }

      gameState.phase = "finished";

      const dealerValue = calculateHandValue(dealerCards);
      const dealerBJ = isBlackjack(dealerCards);
      const dealerBusted = dealerValue > 21;

      let totalWinnings = 0;
      const results: string[] = [];

      for (let i = 0; i < hands.length; i++) {
        const hand = hands[i];
        const playerValue = calculateHandValue(hand.cards);
        const playerBJ = isBlackjack(hand.cards) && !hand.doubled; // No BJ bonus if doubled/split
        const handLabel = hands.length > 1 ? `Hand ${i + 1}: ` : "";

        if (hand.busted) {
          results.push(`${handLabel}💥 Bust! Lost 🧼**${hand.bet.toLocaleString()}**`);
        } else if (playerBJ && dealerBJ) {
          results.push(
            `${handLabel}🤝 Push (both Blackjack)! Returned 🧼**${hand.bet.toLocaleString()}**`
          );
          totalWinnings += hand.bet;
        } else if (playerBJ) {
          const bjWin = Math.floor(hand.bet * 2.5);
          results.push(`${handLabel}🃏 BLACKJACK! Won 🧼**${bjWin.toLocaleString()}** (3:2)`);
          totalWinnings += bjWin;
        } else if (dealerBJ) {
          results.push(`${handLabel}😱 Dealer Blackjack! Lost 🧼**${hand.bet.toLocaleString()}**`);
        } else if (dealerBusted) {
          const win = hand.bet * 2;
          results.push(`${handLabel}🎉 Dealer busts! Won 🧼**${win.toLocaleString()}**`);
          totalWinnings += win;
        } else if (playerValue > dealerValue) {
          const win = hand.bet * 2;
          results.push(
            `${handLabel}🎉 ${playerValue} beats ${dealerValue}! Won 🧼**${win.toLocaleString()}**`
          );
          totalWinnings += win;
        } else if (dealerValue > playerValue) {
          results.push(
            `${handLabel}😢 ${dealerValue} beats ${playerValue}. Lost 🧼**${hand.bet.toLocaleString()}**`
          );
        } else {
          results.push(`${handLabel}🤝 Push! Returned 🧼**${hand.bet.toLocaleString()}**`);
          totalWinnings += hand.bet;
        }
      }

      gameState.resultMessage = results.join("\n");

      // Determine color based on overall outcome
      const totalBet = hands.reduce((sum, h) => sum + h.bet, 0);
      if (totalWinnings > totalBet) {
        gameState.resultColor = "#44ff44"; // Win - green
      } else if (totalWinnings < totalBet) {
        gameState.resultColor = "#ff4444"; // Loss - red
      } else {
        gameState.resultColor = "#ffaa00"; // Push - yellow
      }

      // Pay out winnings
      if (totalWinnings > 0) {
        const currentPoints = await getPoints(member.id);
        await setPoints(member.id, currentPoints + totalWinnings);
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // Check for Immediate Blackjack
    // ═════════════════════════════════════════════════════════════════════════

    const playerBJ = isBlackjack(hands[0].cards);
    const dealerBJ = isBlackjack(dealerCards);

    if (playerBJ || dealerBJ) {
      // For immediate blackjack, skip dealer animation and resolve directly
      gameState.phase = "finished";

      let totalWinnings = 0;
      const results: string[] = [];
      const hand = hands[0];

      if (playerBJ && dealerBJ) {
        results.push(`🤝 Push (both Blackjack)! Returned 🧼**${hand.bet.toLocaleString()}**`);
        totalWinnings = hand.bet;
      } else if (playerBJ) {
        const bjWin = Math.floor(hand.bet * 2.5);
        results.push(`🃏 BLACKJACK! Won 🧼**${bjWin.toLocaleString()}** (3:2)`);
        totalWinnings = bjWin;
      } else {
        results.push(`😱 Dealer Blackjack! Lost 🧼**${hand.bet.toLocaleString()}**`);
      }

      gameState.resultMessage = results.join("\n");

      if (totalWinnings > hand.bet) {
        gameState.resultColor = "#44ff44";
      } else if (totalWinnings < hand.bet) {
        gameState.resultColor = "#ff4444";
      } else {
        gameState.resultColor = "#ffaa00";
      }

      if (totalWinnings > 0) {
        const currentPoints = await getPoints(member.id);
        await setPoints(member.id, currentPoints + totalWinnings);
      }

      const embed = buildEmbed();
      const row = await buildButtons();
      row.components.forEach((btn) => btn.setDisabled(true));
      await interaction.reply({ embeds: [embed], components: [row] });
      return true;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Send Initial Game State
    // ═════════════════════════════════════════════════════════════════════════

    const embed = buildEmbed();
    const row = await buildButtons();

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      withResponse: true,
    });
    const reply = response.resource!.message! as Message;

    // ═════════════════════════════════════════════════════════════════════════
    // Button Collector
    // ═════════════════════════════════════════════════════════════════════════

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on("collect", async (btn) => {
      if (!btn.customId.includes(interaction.id)) return;

      if (btn.user.id !== member.id) {
        btn.reply({ content: "This isn't your game!", flags: MessageFlags.Ephemeral });
        return;
      }

      if (!isPhase("player")) return;

      await btn.deferUpdate();

      const currentHand = hands[gameState.currentHandIndex];

      // ═══════════════════════════════════════════════════════════════════════
      // HIT
      // ═══════════════════════════════════════════════════════════════════════
      if (btn.customId === `bj_hit_${interaction.id}`) {
        currentHand.cards.push(deck.pop()!);

        if (calculateHandValue(currentHand.cards) > 21) {
          currentHand.busted = true;
          advanceGame();

          if (isPhase("dealer")) {
            await resolveGame(reply);
          }
        }

        const newEmbed = buildEmbed();
        const newRow = await buildButtons();
        if (isPhase("finished")) {
          newRow.components.forEach((b) => b.setDisabled(true));
        }
        await reply.edit({ embeds: [newEmbed], components: [newRow] });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STAND
      // ═══════════════════════════════════════════════════════════════════════
      else if (btn.customId === `bj_stand_${interaction.id}`) {
        currentHand.stood = true;
        advanceGame();

        if (isPhase("dealer")) {
          await resolveGame(reply);
        }

        const newEmbed = buildEmbed();
        const newRow = await buildButtons();
        if (isPhase("finished")) {
          newRow.components.forEach((b) => b.setDisabled(true));
        }
        await reply.edit({ embeds: [newEmbed], components: [newRow] });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // DOUBLE
      // ═══════════════════════════════════════════════════════════════════════
      else if (btn.customId === `bj_double_${interaction.id}`) {
        const currentPoints = await getPoints(member.id);
        if (currentPoints < currentHand.bet) return;

        // Deduct additional bet
        await setPoints(member.id, currentPoints - currentHand.bet);
        currentHand.bet *= 2;
        currentHand.doubled = true;

        // Draw one card and stand
        currentHand.cards.push(deck.pop()!);

        if (calculateHandValue(currentHand.cards) > 21) {
          currentHand.busted = true;
        } else {
          currentHand.stood = true;
        }

        advanceGame();

        if (isPhase("dealer")) {
          await resolveGame(reply);
        }

        const newEmbed = buildEmbed();
        const newRow = await buildButtons();
        if (isPhase("finished")) {
          newRow.components.forEach((b) => b.setDisabled(true));
        }
        await reply.edit({ embeds: [newEmbed], components: [newRow] });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SPLIT
      // ═══════════════════════════════════════════════════════════════════════
      else if (btn.customId === `bj_split_${interaction.id}`) {
        if (!canSplit(currentHand.cards) || hands.length >= 4) return;

        const currentPoints = await getPoints(member.id);
        if (currentPoints < currentHand.bet) return;

        // Deduct bet for new hand
        await setPoints(member.id, currentPoints - currentHand.bet);

        // Split the hand
        const splitCard = currentHand.cards.pop()!;
        currentHand.cards.push(deck.pop()!); // Add new card to current hand

        // Create new hand with the split card
        const newHand: Hand = {
          cards: [splitCard, deck.pop()!],
          bet: currentHand.bet,
          stood: false,
          busted: false,
          doubled: false,
        };
        hands.splice(gameState.currentHandIndex + 1, 0, newHand);

        // Check if current hand busted after getting new card
        if (calculateHandValue(currentHand.cards) > 21) {
          currentHand.busted = true;
          advanceGame();
        }

        const newEmbed = buildEmbed();
        const newRow = await buildButtons();
        await reply.edit({ embeds: [newEmbed], components: [newRow] });
      }

      // Reset collector timer on each action
      collector.resetTimer();
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time" && isPhase("player")) {
        // Auto-stand on timeout
        hands[gameState.currentHandIndex].stood = true;
        advanceGame();

        while (isPhase("player")) {
          hands[gameState.currentHandIndex].stood = true;
          advanceGame();
        }

        await resolveGame(reply);

        gameState.resultMessage = `⏰ Time's up! Auto-standing...\n\n${gameState.resultMessage}`;

        const timeoutEmbed = buildEmbed();
        const timeoutRow = await buildButtons();
        timeoutRow.components.forEach((b) => b.setDisabled(true));

        await reply.edit({ embeds: [timeoutEmbed], components: [timeoutRow] }).catch(() => {});
      }
    });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option.setName("bet").setDescription("Amount of 🧼 to bet").setRequired(true)
      );
  }
}

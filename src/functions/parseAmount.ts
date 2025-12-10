export default function parseAmount(input: string | null, maxValue: number): number | null {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  if (normalized === "all" || normalized === "max") return maxValue;
  if (normalized === "half") return Math.floor(maxValue / 2);

  const percentMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    if (isNaN(percent) || percent < 0 || percent > 100) return null;
    return Math.floor((maxValue * percent) / 100);
  }

  const suffixMultipliers: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
    t: 1_000_000_000_000,
  };

  const amountMatch = normalized.match(/^(\d+(?:[,_]\d{3})*(?:\.\d+)?)\s*([kmbt])?$/);
  if (amountMatch) {
    const numStr = amountMatch[1].replace(/[,_]/g, "");
    const num = parseFloat(numStr);
    const suffix = amountMatch[2];
    if (isNaN(num)) return null;
    const multiplier = suffix ? suffixMultipliers[suffix] : 1;
    return Math.floor(num * multiplier);
  }

  const plainNum = parseFloat(normalized.replace(/[,_]/g, ""));
  if (!isNaN(plainNum)) return Math.floor(plainNum);

  return null;
}

export default async function decodeNumber(numberToDecode: string) {
  const first_replace = numberToDecode
    .toLowerCase()
    .replaceAll("k", "*1000*")
    .replaceAll("m", "*1000000*")
    .replaceAll("b", "*1000000000*")
    .replaceAll("t", "*1000000000000*");
  const second_replace = first_replace.replaceAll("**", "*");

  const interatable = second_replace.split("*");

  let final: number = 1;
  for (const n of interatable) {
    if (n) {
      const parsed = parseInt(n);
      if (!isNaN(parsed)) {
        final *= parsed;
      }
    }
  }

  return isNaN(final) ? 0 : final;
}

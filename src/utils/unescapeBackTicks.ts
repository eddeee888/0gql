export const unescapeBackTicks = (text: string): string =>
  text.replaceAll(/\\`/g, "`");

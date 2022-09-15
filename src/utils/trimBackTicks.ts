export const trimBackTicks = (text: string): string =>
  text.replace(/[`]+/g, "");

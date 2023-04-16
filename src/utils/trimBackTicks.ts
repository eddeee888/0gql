export const trimBackTicks = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
    return trimmed.slice(1, -1);
  }
  return text;
};

export const retryStrategy = function (attempts: number) {
  if (attempts < 8) return 2000;
  if (attempts < 14) return 4000;
  if (attempts < 18) return 6000;
  return undefined;
};

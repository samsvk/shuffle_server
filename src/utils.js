export function randomEmailGenerator() {
  const url = "mask.me";
  // important to check if the rng email is already existing elsewhere
  const rngHash = (Math.random() + 1).toString(36).substring(12);
  return `${rngHash}@${url}`;
}

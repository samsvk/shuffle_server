export function randomEmailGenerator() {
  const url = "mask.me";
  // important to check if the rng email is already existing elsewhere
  const rngHash = (Math.random() + 1).toString(36).substring(7);
  return `${rngHash}@${url}`;
}

export function generateRandomNumber() {
  const nums = [...Array(50).keys()];
  return nums[Math.floor(Math.random() * nums.length)];
}

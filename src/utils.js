export function randomEmailGenerator() {
  const url = "mask.me";
  // important to check if the rng email is already existing elsewhere
  const rngHash = (Math.random() + 1).toString(36).substring(7);
  return `${rngHash}@${url}`;
}

// export const getAccessToken = async () => {
//   const response = await fetch(
//     "https://api.cloudmailin.com/api/v0.1/c23731b2f948c506/messages",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer API_TOKEN`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         grant_type: "refresh_token",
//       }),
//     }
//   );

//   return response.json();
// };

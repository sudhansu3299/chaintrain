import { SuiClient, getFullnodeUrl } from "@mysten/sui.js";

export const sui = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

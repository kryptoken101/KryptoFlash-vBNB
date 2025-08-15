// Configuration for RPC endpoints
export const PROXY_URL = ""; // Paste your Render proxy URL here (e.g., "https://your-proxy.onrender.com/rpc")
export const FALLBACK_RPC = "https://virtual.binance.eu.rpc.tenderly.co/8aaba2bb-634b-464b-82ac-4527bc9fdf8e";

export function getRpcUrl() {
  return PROXY_URL && PROXY_URL.trim() !== "" ? PROXY_URL : FALLBACK_RPC;
}

// frontend/src/config.js
export const PROXY_URL = "";
export const FALLBACK_RPC = "https://virtual.binance.eu.rpc.tenderly.co/8aaba2bb-634b-464b-82ac-4527bc9fdf8e";
export const DEFAULT_TOKEN = { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", logo: "https://cryptologos.cc/logos/tether-usdt-logo.svg" };
export function getRpcUrl() { return PROXY_URL && PROXY_URL.trim() !== "" ? PROXY_URL : FALLBACK_RPC; }

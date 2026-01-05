import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export function uint8ToBs58(input) {
  const parsed = JSON.parse(input.startsWith("[") ? input : `[${input}]`);
  const uint8 = new Uint8Array(parsed);
  return bs58.encode(uint8);
}

export function bs58ToUint8(input) {
  const uint8 = bs58.decode(input);
  return uint8;
}

export function generateKeypair() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKeyBs58: bs58.encode(keypair.secretKey),
    secretKeyUint8: keypair.secretKey,
  };
}

export function checkMatch(pubkey, start, end, ignoreCase) {
  let p = pubkey;
  let s = start;
  let e = end;

  if (ignoreCase) {
    p = p.toLowerCase();
    s = s.toLowerCase();
    e = e.toLowerCase();
  }

  const matchStart = !s || p.startsWith(s);
  const matchEnd = !e || p.endsWith(e);

  return matchStart && matchEnd;
}

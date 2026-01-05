import { Command } from "commander";
import chalk from "chalk";
import {
  uint8ToBs58,
  bs58ToUint8,
  generateKeypair,
  checkMatch,
} from "./utils.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const program = new Command();

program
  .name("solana-key-utils")
  .description("Utilities for Solana secret keys")
  .version("1.0.0");

// 1. Convert Uint8Array to Base58
program
  .command("uint8-to-bs58")
  .description("Convert Uint8Array secret key to Base58")
  .argument("<key>", "JSON string or comma-separated list of Uint8Array")
  .action((keyStr) => {
    try {
      const b58 = uint8ToBs58(keyStr);
      console.log(chalk.green("Base58:"), b58);
    } catch (e) {
      console.error(chalk.red("Error parsing input:"), e.message);
    }
  });

// 2. Convert Base58 to Uint8Array
program
  .command("bs58-to-uint8")
  .description("Convert Base58 secret key to Uint8Array")
  .argument("<b58>", "Base58 string")
  .action((b58Str) => {
    try {
      const uint8 = bs58ToUint8(b58Str);
      console.log(chalk.green("Uint8Array:"), `[${uint8.toString()}]`);
    } catch (e) {
      console.error(chalk.red("Error decoding Base58:"), e.message);
    }
  });

// 3. Generate New Secret Key
program
  .command("generate")
  .description("Generate a new secret key")
  .action(() => {
    const { publicKey, secretKeyBs58, secretKeyUint8 } = generateKeypair();
    console.log(chalk.blue("Public Key:"), publicKey);
    console.log(chalk.green("Secret Key (Base58):"), secretKeyBs58);
    console.log(
      chalk.yellow("Secret Key (Uint8):"),
      `[${secretKeyUint8.toString()}]`,
    );
  });

// 4. Grind Secret Key
program
  .command("grind")
  .description("Grind for a vanity public key")
  .option("-s, --starts-with <string>", "Prefix to match (case-sensitive)")
  .option("-e, --ends-with <string>", "Suffix to match (case-sensitive)")
  .option("-c, --count <number>", "Number of keys to generate", "1")
  .option("-i, --ignore-case", "Ignore case matching")
  .action((options) => {
    const startsWith = options.startsWith || "";
    const endsWith = options.endsWith || "";
    const count = parseInt(options.count);
    const ignoreCase = options.ignoreCase;

    if (!startsWith && !endsWith) {
      console.error(
        chalk.red("Error: Must specify --starts-with or --ends-with"),
      );
      process.exit(1);
    }

    console.log(chalk.cyan(`Grinding for ${count} keys...`));
    if (startsWith) console.log(`Starts with: "${startsWith}"`);
    if (endsWith) console.log(`Ends with: "${endsWith}"`);

    let found = 0;
    let attempts = 0;
    const startTime = Date.now();

    while (found < count) {
      const kp = Keypair.generate();
      const pub = kp.publicKey.toBase58();

      if (checkMatch(pub, startsWith, endsWith, ignoreCase)) {
        found++;
        console.log(
          chalk.green(`\nMatch #${found} found after ${attempts} attempts:`),
        );
        console.log(chalk.blue("Public Key:"), pub);
        console.log(chalk.yellow("Secret Key:"), bs58.encode(kp.secretKey));
      }

      attempts++;
      if (attempts % 100000 === 0) {
        process.stdout.write(`\rAttempts: ${attempts.toLocaleString()}...`);
      }
    }
    const duration = (Date.now() - startTime) / 1000;
    console.log(
      chalk.cyan(`\nDone. Found ${found} keys in ${duration.toFixed(2)}s.`),
    );
  });

program.parse();

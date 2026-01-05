use clap::{Parser, Subcommand};
use rayon::prelude::*;
use solana_sdk::signature::{Keypair, Signer};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

#[derive(Parser)]
#[command(name = "solana-key-utils")]
#[command(about = "Utilities for Solana secret keys", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Convert Uint8Array (JSON format) to Base58
    Uint8ToBs58 {
        /// JSON string of the array, e.g. "[1,2,3...]"
        input: String,
    },
    /// Convert Base58 string to Uint8Array
    Bs58ToUint8 {
        /// Base58 string
        input: String,
    },
    /// Generate a new random keypair
    Generate,
    /// Grind for a vanity public key
    Grind {
        /// Prefix to match
        #[arg(short, long)]
        starts_with: Option<String>,
        /// Suffix to match
        #[arg(short, long)]
        ends_with: Option<String>,
        /// Number of keys to find
        #[arg(short, long, default_value_t = 1)]
        count: usize,
        /// Ignore case
        #[arg(short, long)]
        ignore_case: bool,
    },
}

// Logic extracted for testing
fn parse_u8_array(input: &str) -> Result<Vec<u8>, String> {
    let trimmed = input.trim_matches(|c| c == '[' || c == ']');
    if trimmed.trim().is_empty() {
        return Ok(vec![]);
    }
    trimmed
        .split(',')
        .map(|s| {
            s.trim()
                .parse::<u8>()
                .map_err(|e| format!("Invalid byte '{}': {}", s, e))
        })
        .collect()
}

fn check_match(pubkey: &str, start: &str, end: &str, ignore_case: bool) -> bool {
    if ignore_case {
        let p_lower = pubkey.to_lowercase();
        let s_lower = start.to_lowercase();
        let e_lower = end.to_lowercase();
        p_lower.starts_with(&s_lower) && p_lower.ends_with(&e_lower)
    } else {
        pubkey.starts_with(start) && pubkey.ends_with(end)
    }
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Uint8ToBs58 { input } => match parse_u8_array(&input) {
            Ok(b) => println!("Base58: {}", bs58::encode(b).into_string()),
            Err(e) => eprintln!("Error parsing Uint8Array: {}", e),
        },
        Commands::Bs58ToUint8 { input } => match bs58::decode(&input).into_vec() {
            Ok(bytes) => println!("Uint8Array: {:?}", bytes),
            Err(e) => eprintln!("Error decoding Base58: {}", e),
        },
        Commands::Generate => {
            let kp = Keypair::new();
            println!("Public Key: {}", kp.pubkey());
            println!(
                "Secret Key (Base58): {}",
                bs58::encode(kp.secret().to_bytes()).into_string()
            );
            println!("Secret Key (Uint8): {:?}", kp.to_bytes());
        }
        Commands::Grind {
            starts_with,
            ends_with,
            count,
            ignore_case,
        } => {
            if starts_with.is_none() && ends_with.is_none() {
                eprintln!("Error: Must specify --starts-with or --ends-with");
                return;
            }

            let start_prefix = starts_with.unwrap_or_default();
            let end_suffix = ends_with.unwrap_or_default();

            println!("Grinding for {} keys...", count);
            println!(
                "Starts with: '{}', Ends with: '{}'",
                start_prefix, end_suffix
            );

            let found_count = Arc::new(AtomicU64::new(0));
            let total_attempts = Arc::new(AtomicU64::new(0));
            let start_time = Instant::now();

            let target = count as u64;

            // Parallel grinder
            (0..rayon::current_num_threads())
                .into_par_iter()
                .for_each(|_| loop {
                    if found_count.load(Ordering::Relaxed) >= target {
                        break;
                    }

                    let kp = Keypair::new();
                    let pubkey_str = kp.pubkey().to_string();

                    if check_match(&pubkey_str, &start_prefix, &end_suffix, ignore_case) {
                        let current = found_count.fetch_add(1, Ordering::SeqCst);
                        if current < target {
                            println!("\nMatch Found:");
                            println!("Public Key: {}", kp.pubkey());
                            println!("Secret Key: {}", bs58::encode(kp.to_bytes()).into_string());
                        }
                    }

                    total_attempts.fetch_add(1, Ordering::Relaxed);
                });

            let duration = start_time.elapsed();
            println!("\nDone. Found {} keys in {:.2?}", count, duration);
            println!("Total attempts: {}", total_attempts.load(Ordering::Relaxed));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_u8_array() {
        assert_eq!(parse_u8_array("[1, 2, 3]"), Ok(vec![1, 2, 3]));
        assert_eq!(parse_u8_array("1, 2, 3"), Ok(vec![1, 2, 3]));
        assert_eq!(parse_u8_array(""), Ok(vec![]));
        assert!(parse_u8_array("[256]").is_err());
    }

    #[test]
    fn test_check_match() {
        assert!(check_match("SoL123", "SoL", "", false));
        assert!(!check_match("sol123", "SoL", "", false));
        assert!(check_match("sol123", "SoL", "", true));
        assert!(check_match("123End", "", "End", false));
        assert!(check_match("StartEnd", "Start", "End", false));
    }
}

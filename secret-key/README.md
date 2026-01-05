# Solana Secret Key Utils

A comprehensive suite of high-performance utilities for managing Solana secret keys. This repository contains implementations in **Node.js**, **Rust**, and a client-side **HTML/JS** web application.

Designed for developers who need fast, reliable tools for key generation, format conversion, and vanity address mining.

## 🚀 Implementations

### 1. Node.js CLI

A versatile command-line interface built with `commander` and `bs58`.

**Location:** `secret-key/node`

**Features:**

- Convert `Uint8Array` to Base58
- Convert Base58 to `Uint8Array`
- Generate new keypairs
- Vanity address grinding (prefix/suffix matching)

**Installation & Usage:**

```bash
cd secret-key/node
pnpm install
# Generate a key
node index.js generate
# Grind a vanity address
node index.js grind --starts-with sol --count 1
```

### 2. Rust CLI

A high-performance CLI tool leveraging `rayon` for parallel processing, making it significantly faster for vanity address grinding.

**Location:** `secret-key/rust`

**Features:**

- **Multi-threaded grinding** for maximum speed
- Same feature set as Node.js version
- optimized for local execution

**Installation & Usage:**

```bash
cd secret-key/rust
# Run directly
cargo run -- generate
# Grind with max speed
cargo run -- grind --starts-with sol --ends-with ana
```

### 3. Web App (HTML/JS)

A standalone, single-file HTML application using ES modules and Tailwind CSS. Perfect for quick visual conversions without installing CLI tools.

**Location:** `secret-key/html`

**Features:**

- Visual converters
- One-click key generation
- Browser-based grinding (non-blocking UI)

**Usage:**
Simply open `secret-key/html/index.html` in any modern web browser.

---

## 🛠 Testing

Both CLI implementations include unit tests to ensure reliability.

**Node.js:**

```bash
cd secret-key/node
pnpm test
```

**Rust:**

```bash
cd secret-key/rust
cargo test
```

## 🔒 Security Note

These tools handle private keys. **Always use them in a secure, offline environment** when generating keys for mainnet assets. The HTML version runs entirely locally in your browser.

## 📄 License

MIT

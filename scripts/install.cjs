const { createInterface } = require("node:readline");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { homedir } = require("node:os");
const { join } = require("node:path");

// ── Constants ──────────────────────────────────────────────────────────

const CONFIG_FILE = join(homedir(), ".config", "opencode", "opencode.json");
const ENCODING = "utf8";
const INDENT = 2;

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Load existing config or start with a minimal scaffold.
 */
const loadConfig = () => {
  if (!existsSync(CONFIG_FILE)) {
    return { $schema: "https://opencode.ai/config.json" };
  }

  const raw = readFileSync(CONFIG_FILE, ENCODING);

  try {
    return JSON.parse(raw);
  } catch {
    console.error(`Error: ${CONFIG_FILE} contains invalid JSON.`);
    process.exit(1);
  }
};

/**
 * Ensure the nested provider/ollama/options path exists on the config object.
 */
const ensureOllamaProvider = (config) => {
  if (!config.provider) {
    config.provider = {};
  }

  if (!config.provider.ollama) {
    config.provider.ollama = {};
  }

  if (!config.provider.ollama.options) {
    config.provider.ollama.options = {};
  }
};

/**
 * Persist the updated config back to disk.
 */
const saveConfig = (config) => {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, INDENT) + "\n", ENCODING);
};

// ── Interactive prompt ─────────────────────────────────────────────────

const promptApiKey = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Enter your Ollama API key (from https://ollama.com/settings/keys): ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });
};

// ── Main ───────────────────────────────────────────────────────────────

const main = async () => {
  const apiKey = await promptApiKey();

  if (!apiKey) {
    console.error("Error: no API key provided.");
    process.exit(1);
  }

  const config = loadConfig();
  ensureOllamaProvider(config);
  config.provider.ollama.options.apiKey = apiKey;
  saveConfig(config);

  console.log(`Ollama API key saved to ${CONFIG_FILE}`);
};

main();

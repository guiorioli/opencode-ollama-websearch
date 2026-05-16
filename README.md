# opencode-ollama-websearch

Fork of [emilsvennesson/opencode-websearch](https://github.com/emilsvennesson/opencode-websearch).

Native web search for [OpenCode](https://opencode.ai), powered by your model's built-in search capability. No extra API keys or search services required. If you're on a supported provider, it works without any extra setup.

This fork adds **Ollama web search support** with an automated installation script.

Inspired by Claude Code's WebSearch tool.

## Example

Asking OpenCode about the latest PostgreSQL version:

> **What's the latest Postgres version?**
>
> ⚙ `web-search` [query=latest PostgreSQL release version April 2026]
>
> As of now (April 2026), the latest PostgreSQL community release is PostgreSQL 18.3.
> If you mean the latest major version line, that is PostgreSQL 18.
>
> Sources:
>
> - [PostgreSQL Roadmap](https://www.postgresql.org/developer/roadmap/)
> - [PostgreSQL News Archive (2026-02-26 release)](https://www.postgresql.org/about/newsarchive/-/20260226/)

## Supported providers

| Provider         | What you need                                                            |
| ---------------- | ------------------------------------------------------------------------ |
| Anthropic        | An Anthropic provider/model in OpenCode with built-in web search support |
| Moonshot (Kimi)  | A Moonshot API key configured in OpenCode                                |
| Ollama           | Ollama configured in OpenCode (see [Ollama setup](#ollama-setup) below)  |
| OpenAI / ChatGPT | OpenAI configured in OpenCode (API key or ChatGPT connected)             |
| GitHub Copilot   | GitHub Copilot connected in OpenCode                                     |

Model-level web search support depends on the provider and model you use.

## Ollama setup

This fork includes **native Ollama web search support**. When you use `ollama launch`, the provider is registered automatically but **without an API key**. The web search API is a cloud-only endpoint (`ollama.com/api/web_search`) and requires an Ollama Cloud API key.

### Install

Run the bundled `install_ollama.sh` script — it will link the plugin globally, install it in OpenCode, and configure your API key:

```sh
./install_ollama.sh
```

The script performs three steps:
1. `npm link` — links the plugin globally via npm
2. `opencode plugin "$(pwd)" -g` — registers the plugin in your global OpenCode config
3. `node scripts/install.cjs` — prompts for your Ollama API key and saves it to `opencode.json`

### Known Ollama cloud models that support web search

- `qwen3:480b-cloud`
- `gpt-oss:120b-cloud`
- `deepseek-v3.1-cloud`
- `kimi-k2.6:cloud`


## Configuration (optional)

By default the plugin uses your active model. The optional `"websearch"` flag lets you pin or provide a fallback model for search:

- `"always"`: always use this model for web search
- `"auto"`: use this model as fallback when your active provider is not supported

### Selection order

1. A model tagged `"websearch": "always"`
2. Your active model (if on a supported provider)
3. A model tagged `"websearch": "auto"`
4. Otherwise, the tool returns an error

### Example

```json
{
  "provider": {
    "openai": {
      "models": {
        "gpt-5.2": {
          "options": {
            "websearch": "always"
          }
        }
      }
    }
  }
}
```

## Development

### Local development

Clone the repo and symlink the source entry into your OpenCode plugin directory:

```sh
git clone https://github.com/emilsvennesson/opencode-websearch ~/.config/opencode/opencode-websearch
cd ~/.config/opencode/opencode-websearch
bun install
mkdir -p ~/.config/opencode/plugin
ln -sf ~/.config/opencode/opencode-websearch/src/index.ts ~/.config/opencode/plugin/websearch.ts
```

OpenCode loads the plugin directly from source at startup.

> When using this symlink setup, remove `"opencode-websearch"` from the `plugin` array in `opencode.json` to avoid loading it twice.

### Commands

```sh
bun install
bun run format
bun run format:check
bun run lint
bun run lint:fix
bun run typecheck
bun run check
bun run build
```

## License

MIT

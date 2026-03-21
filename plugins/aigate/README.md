# aigate

AI-powered command approval gate for Claude Code. Uses a local Ollama model to classify shell commands as **allow**, **deny**, or **ask** before execution.

## How it works

aigate runs as a Claude Code `PreToolUse` hook. Every Bash command is sent to a local Ollama model (default: `qwen2.5-coder:7b`) which classifies it:

- **allow** — normal development commands pass through silently
- **deny** — dangerous commands are blocked
- **ask** — ambiguous commands prompt the user for approval

## Install

### 1. Install dependencies

**macOS**
```bash
brew install nushell ollama
```

**Linux**
```bash
# Nushell
brew install nushell
# or: https://www.nushell.sh/book/installation.html

# Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows**
```powershell
winget install Nushell.Nushell Ollama.Ollama
```

### 2. Pull the model and start Ollama

```bash
ollama pull qwen2.5-coder:7b
ollama serve  # leave running, or it auto-starts on macOS
```

### 3. Install the hook

```bash
mkdir -p ~/.claude/hooks
curl -o ~/.claude/hooks/ai-gate.nu \
  https://raw.githubusercontent.com/bonisoft3/aigate/main/ai-gate.nu
```

### 4. Register in Claude Code

Add to `~/.claude/settings.json` (create the file if it doesn't exist):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "nu ~/.claude/hooks/ai-gate.nu"
          }
        ]
      }
    ]
  }
}
```

That's it. Claude Code will now evaluate every Bash command through the gate.

## Model accuracy

Tested with 17 commands (10 allow, 7 deny):

| Model | Score | Avg latency | Recommended |
|-------|-------|-------------|-------------|
| `qwen2.5-coder:7b` | 17/17 | ~3-5s | Yes |
| `qwen2.5-coder:3b` | 15/17 | ~1.7s | If speed matters |
| `gemma3:4b` | 13/17 | ~2-3s | No |
| `gemma3:1b` | 0/17 | ~1s | No |

## Configuration

Edit constants at the top of `ai-gate.nu`:

| Constant | Default | Description |
|----------|---------|-------------|
| `MODEL` | `qwen2.5-coder:7b` | Ollama model for classification |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API endpoint |
| `TIMEOUT` | `15sec` | Max wait for model response |

Override the endpoint via environment variable:

```bash
export OLLAMA_URL=http://my-gpu-server:11434
```

### Tuning the prompt

If a command is consistently misclassified, add it as a few-shot example in the `gate_prompt` function in `ai-gate.nu`. Small models are very sensitive to examples — a single added example often fixes an entire class of misclassifications.

## Development

```bash
# Install dev tools
mise install

# Syntax check
just build   # or: nu -c 'glob *.nu | each { |f| nu -c "source $f" }'

# Run tests (requires ollama serve)
just test    # or: nu test-gate.nu

# Test a different model
nu test-gate.nu --model qwen2.5-coder:3b

# Integration tests (Docker)
just integrate   # or: docker compose run --build integrate
```

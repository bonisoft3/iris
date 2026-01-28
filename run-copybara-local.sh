#!/bin/bash
set -e

# Get GitHub Token
GH_TOKEN=$(gh auth token)
if [ -z "$GH_TOKEN" ]; then
  echo "Error: Could not retrieve GitHub token. Please run 'gh auth login'."
  exit 1
fi

WORKFLOW=${1:-sayt_local}
ORIGIN_REF=${2:-HEAD}

echo "Starting Copybara in Docker..."

# We pipe the script to the container's bash.
# We use 'EOF' to prevent variable expansion on the host side, 
# so $GH_TOKEN inside the script refers to the container's environment variable.
cat <<'EOF' | docker run --rm -i \
  -v "$(pwd):/src" \
  -w /src \
  -e GH_TOKEN="$GH_TOKEN" \
  -e COPYBARA_WORKFLOW="$WORKFLOW" \
  -e COPYBARA_ORIGIN_REF="$ORIGIN_REF" \
  eclipse-temurin:21-jdk-jammy \
  /bin/bash
    set -e
    
    # 1. Install dependencies
    # Check for git and curl
    if ! command -v git &> /dev/null || ! command -v curl &> /dev/null; then
        echo "Installing dependencies..."
        apt-get update -qq && apt-get install -y -qq git curl > /dev/null
    fi

    # 2. Download Copybara JAR
    COPYBARA_URL='https://github.com/google/copybara/releases/download/v20260112/copybara_deploy.jar'
    echo "Downloading Copybara..."
    curl -L -s -o /tmp/copybara.jar "$COPYBARA_URL"

    # 3. Configure Git
    git config --global user.email "copybara-local@example.com"
    git config --global user.name "Copybara Local"
    # Use the token for HTTPS auth
    git config --global url."https://oauth2:${GH_TOKEN}@github.com/".insteadOf "https://github.com/"
    git config --global url."https://oauth2:${GH_TOKEN}@github.com/".insteadOf "git@github.com:"
    git config --global --add safe.directory /src

    # 4. Prepare Local Config
    echo "Preparing local Copybara config..."
    # Override local origin and ref for this run.
    sed -e 's|^LOCAL_ORIGIN = \".*\"$|LOCAL_ORIGIN = \"file:///src\"|g' \
        -e "s|^ORIGIN_REF = \".*\"$|ORIGIN_REF = \"${COPYBARA_ORIGIN_REF}\"|g" \
        copy.bara.sky > /tmp/copy.bara.sky
    
    # 5. Run Copybara
    echo "Running Copybara..."
    java -jar /tmp/copybara.jar migrate /tmp/copy.bara.sky "${COPYBARA_WORKFLOW}" --force --init-history
EOF

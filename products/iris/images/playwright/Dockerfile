FROM mcr.microsoft.com/playwright:v1.46.0-jammy@sha256:860c541d62e212fa2d857afca98730dad12b641f941b9b5ed892e379e9e121bb

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

WORKDIR /playwright
COPY package.json pnpm-lock.yaml /playwright/
RUN pnpm install --frozen-lockfile

COPY playwright.config.ts  /playwright/playwright.config.ts
COPY tests /playwright/tests

ENV CI true
CMD pnpm playwright test

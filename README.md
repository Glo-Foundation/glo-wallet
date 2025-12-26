# Glo Wallet by [glodollar.org](https://glodollar.org)

Welcome! The Glo Wallet is a web3 dApp created by the Glo Foundation that seeks to fulfill three purposes:

1.  **Be the entry point** for joining the Glo Dollar Movement
2.  **Minimize friction** for crypto newcomers to buy the Glo Dollar and start using it to pay for things in the real world
3.  **Activate the Community** to help grow the Glo Dollar Movement by completing specific Call To Actions
4.  **Be the entry point** for joining the Glo Dollar Movement
5.  **Minimize friction** for crypto newcomers to buy the Glo Dollar and start using it to pay for things in the real world
6.  **Activate the Community** to help grow the Glo Dollar Movement by completing specific Call To Actions

The Glo Wallet leverages the [Sequence wallet](https://sequence.xyz/) for web2 friendly authentication, and is built upon [wagmi](https://github.com/wagmi-dev/wagmi).

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL (v14 or later)
- Git

## Database Setup

### MacOS

```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql

# Setup Database
psql postgres
```

In your SQL terminal, run:

```bash
CREATE USER glowallet_user WITH PASSWORD 'glowallet123';
CREATE DATABASE glo_wallet OWNER glowallet_user;
\c glo_wallet
GRANT ALL PRIVILEGES ON DATABASE glo_wallet TO glowallet_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO glowallet_user;
```

### Linux

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup Database
sudo -u postgres psql
```

In your SQL terminal, run:

```bash
CREATE USER glowallet_user WITH PASSWORD 'glowallet123';
CREATE DATABASE glo_wallet OWNER glowallet_user;
\c glo_wallet
GRANT ALL PRIVILEGES ON DATABASE glo_wallet TO glowallet_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO glowallet_user;
```

### Windows

```bash
# Using psql after installing PostgreSQL
psql -U postgres
```

Then run in your terminal:

```bash
CREATE USER glowallet_user WITH PASSWORD 'glowallet123';
CREATE DATABASE glo_wallet OWNER glowallet_user;
\c glo_wallet
GRANT ALL PRIVILEGES ON DATABASE glo_wallet TO glowallet_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO glowallet_user;
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/glo-wallet.git
cd glo-wallet
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file based on `.env.example` with the following variables. Don't forget to replace the placeholder values with your own:

#### RPC URLs

```
NEXT_PUBLIC_GOERLI_RPC_URL="https://ethereum-goerli.publicnode.com"
NEXT_PUBLIC_ALFAJORES_RPC_URL="https://alfajores-forno.celo-testnet.org"
NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL="https://sepolia.optimism.io"
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL="https://base-sepolia-rpc.publicnode.com"
```

#### API Keys

```
WEBHOOK_API_KEY="your-webhook-api-key"
CMC_API_KEY="your-cmc-api-key"
NEXT_PUBLIC_ALCHEMY_KEY="your-alchemy-key"
MORALIS_API_KEY="your-moralis-api-key"
```

#### KV Storage

```
KV_URL="your-kv-url"
KV_REST_API_URL="your-kv-rest-api-url"
KV_REST_API_TOKEN="your-kv-rest-api-token"
KV_REST_API_READ_ONLY_TOKEN="your-kv-rest-api-read-only-token"
```

#### Database

```
VERCEL_URL="localhost:3000"
POSTGRES_URL="postgresql://glowallet_user:glowallet123@localhost:5432/glo_wallet?schema=public"
```

4. Run the application:

```bash
npm run dev
```

Visit http://localhost:3000 to see the application running.

### Preview

The application will look like this when running:
![Example image](public/home.png)

## Contribute

Want to add a feature or experiencing an issue that needs to be fixed? Create an issue and/or raise a PR, tag @gglucass and we'll look at it as soon as we can.

Note that the Glo Wallet's core features are limited to purely the basics so that it is ideal for crypto newcomers. We will only build additional features when they contribute to one of the purposes in the first section _or_ if they contribute to our growth goals by making the Glo Wallet more lovable.

For transparency, please tag each feature request with one of the following:

- Core functionality
- Entry Point
- Friction reduction
- Community activation
- Lovable

## Styleguide

We use Tailwind for styling. As a rule of thumb, we use **component-scoped styling** per [Tailwind guidelines](https://tailwindcss.com/docs/adding-custom-styles#layers-and-per-component-css). That means you can do the following:

- Use inline styling for each React component
- Add a reusable Tailwind component directive in `globals.css`

_Avoid modifying the @base layer in `globals.css` (such as `span`, `p`, etc.) unless absolutely necessary. If doing so, make sure to smoke test elements in the app thoroughly to catch breaking changes._

## End-to-end Testing

We use [GuardianUI](https://github.com/GuardianUI/GuardianTest) on top of [Playwright](https://playwright.dev/) for end-to-end testing. To set up for the first time, run `npx playwright install` after `npm install`. Then, to run the tests, run `npm run test:e2e` (or `npm run test:e2e:headless` for headless mode). Setting the `E2E_ENV` environment variable to production or test will run the tests against the production or test environment, respectively. By default, the tests will run against the local development environment.

If you're developing on VSCode, you can install the [Playwright extension](https://playwright.dev/docs/getting-started-vscode) for ease of use.

Additionally, a helpful set of example end-to-end tests can be found in [this directory](https://github.com/GuardianUI/GuardianTest/tree/main/test-examples).

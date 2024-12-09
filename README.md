# Glo Wallet by [glodollar.org](https://glodollar.org)

Welcome! The Glo Wallet is a web3 dApp created by the Glo Foundation that seeks to fulfill three purposes:

1.  **Be the entry point** for joining the Glo Dollar Movement
2.  **Minimize friction** for crypto newcomers to buy the Glo Dollar and start using it to pay for things in the real world
3.  **Activate the Community** to help grow the Glo Dollar Movement by completing specific Call To Actions

The Glo Wallet leverages the [Sequence wallet](https://sequence.xyz/) for web2 friendly authentication, and is built upon [wagmi](https://github.com/wagmi-dev/wagmi).

## Setup Local Environment for Development

### Prerequisites

Before you start, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (version 6 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/) CLI

### 1\. Clone the Repository

```
git clone https://github.com/Glo-Foundation/glo-wallet.git
cd glo-wallet
```

### 2\. Install Dependencies

```
npm install
```

### 3\. Set Up Environment Variables

Copy the example environment variables file and modify it for your local setup:

```
cp .env.example .env
```

Update the `.env` file with your local development values (e.g., for running a local PostgreSQL database).

### 4\. Set Up PostgreSQL Database

If you don't have PostgreSQL installed, you can install it using Homebrew on macOS:

```
brew install postgresql
```

For Linux users, you can install PostgreSQL using the following commands:

```
sudo apt update
sudo apt install postgresql postgresql-contrib
```

For Windows users, download and install PostgreSQL from the [official website](https://www.postgresql.org/download/windows/).

Start the PostgreSQL service:

```
brew services start postgresql
```

For Linux users:

```
sudo service postgresql start
```

For Windows users, start the PostgreSQL service from the Services application or using the pgAdmin tool.

Create a new PostgreSQL database:

```
createdb mydatabase
```

Create a new PostgreSQL user with a password (optional):

```
psql postgres
CREATE USER myuser WITH PASSWORD 'mypassword';
ALTER USER myuser WITH SUPERUSER;
```

Update the `.env` file with the PostgreSQL connection string:

```
POSTGRES_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
```

### 5\. Run Database Migrations

```
npx prisma migrate deploy
```

### 6\. Start the Development Server

```
npm run dev
```

### 7\. Access the UI

Open your web browser and navigate to `http://localhost:3000` to access the Glo Wallet UI.

## Environment Variables

Environment variables are stored in [Vercel](https://vercel.com/glodollar/glo-wallet/settings/environment-variables). The easiest way to retrieve them is to use the [Vercel CLI](https://vercel.com/docs/cli) and run `vercel env pull`. Make sure you link your repo first with `vercel link`.

## Contribute

Want to add a feature or experiencing an issue that needs to be fixed? Create an issue and/or raise a PR, tag @gglucass and we'll look at it as soon as we can.

Note that the Glo Wallet's core wallet features are limited to purely the basics so that it is ideal for crypto newcomers. We have no ambitions to expand the wallet's feature set beyond the absolute must-have requirements. We will only build additional features when they contribute to one of the purposes in the first section _or_ if they contribute to our growth goals by making the Glo Wallet more lovable.

For transparency, please tag each feature request with one of the following:

1.  Core functionality
2.  Entry Point
3.  Friction reduction
4.  Community activation
5.  Lovable

## Styleguide

We use Tailwind for styling. As a rule of thumb, we use **component scoped styling** per [Tailwind guidelines](https://tailwindcss.com/docs/adding-custom-styles#layers-and-per-component-css). That means you can do the following:

- Use inline styling for each React component
- Add a reusable Tailwind component directive in `globals.css`

_Avoid modifying the @base layer in `globals.css` (such as `span`, `p`, etc.) unless absolutely necessary. If doing so, make sure to smoke test the element in the app thoroughly to catch breaking changes._

## End-to-end Testing

We use [GuardianUI](https://github.com/GuardianUI/GuardianTest) on top of [Playwright](https://playwright.dev/) for end-to-end testing. To set up for the first time, run `npx playwright install` after `npm install`. Then, to run the tests, run `npm run test:e2e` (or `npm run test:e2e:headless` for headless mode). Setting the `E2E_ENV` environment variable to production or test will run the tests against the production or test environment, respectively. By default, the tests will run against the local development environment. If you're developing on VSCode, you can install the [Playwright extension](https://playwright.dev/docs/getting-started-vscode) for ease of use.

Additionally, a helpful set of example end-to-end tests can be found in [this directory](https://github.com/GuardianUI/GuardianTest/tree/main/test-examples).

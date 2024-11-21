# Glo wallet by [glodollar.org](https://glodollar.org)

Welcome! The Glo Wallet is a web3 dApp created by the Glo Foundation that seeks to fulfill three purposes:

1. **Be the entry point** for joining the Glo Dollar Movement
2. **Minimize friction** for crypto newcomers to buy the Glo Dollar and start using it to pay for things in the real world
3. **Activate the Community** to help grow the Glo Dollar Movement by completing specific Call To Actions

The Glo Wallet leverages the [Sequence wallet](https://sequence.xyz/) for web2 friendly authentication, and is built upon [wagmi](https://github.com/wagmi-dev/wagmi).

## Setup Local Environment for Development
Clone The Repository:
```
git clone https://github.com/Glo-Foundation/glo-wallet.git

```

change directory:
```
cd glo-wallet
```
Install dependencies:

```
 yarn install || npm install
```

### Environment variables
Create a `.env` file in the root directory with the following variables:

```
cp .env.example .env
```

Change the values for your local development (e.g. for running a local PostgreSQL database).

### Run

```
npm run dev
```

## Env variables

Env variables are stored in [Vercel](https://vercel.com/glodollar/glo-wallet/settings/environment-variables).

The easiest way to retrieve is to use [Vercel CLI](https://vercel.com/docs/cli) and run `vercel env pull`. Make sure you link your repo first with `vercel link`.

## Contribute

Want to add a feature or experiencing an issue that needs to be fixed? Create an issue and/or raise a PR, tag @gglucass and we'll look at it as soon as we can.

Note that the Glo Wallet its core wallet features are limited to purely the basics so that it is ideal for crypto newcomers. We have no ambitions to expand the wallet its feature set beyond the absolute must have requirements. We will only build additional features when they contribute to one of the purposes in the first section _or_ if they contribute to our growth goals by making the Glo Wallet more lovable.

For transparency, please tag each feature request with one of the following:

1. Core functionality
2. Entry Point
3. Friction reduction
4. Community activation
5. Lovable

## Styleguide

We use Tailwind for styling. As a rule of thumb we use use **component scoped styling** per [Tailwind guidelines](https://tailwindcss.com/docs/adding-custom-styles#layers-and-per-component-css). That means you can do the following:

- use inline styling for each React component
- add a reusable Tailwind component directive in `globals.css`

_Avoid modifying the @base layer in `globals.css` (such as `span`, `p`, etc.) unless absolutely necessary. If doing so, make sure to smoke test element in app thoroughly to catch breaking changes._

## End-to-end testing

We use [GuardianUI](https://github.com/GuardianUI/GuardianTest) on top of [Playwright](https://playwright.dev/) for end-to-end testing. To set up for the first
time, run `npx playwright install` after `npm install`. Then, to run the tests, run `npm run test:e2e` (or `npm run test:e2e:headless` for headless mode). Setting the `E2E_ENV` environment variable to production or test will run the tests against the production or test environment, respectively. By default, the tests will run against the local development environment. If you're developing on VSCode, you can install the [Playwright extension](https://playwright.dev/docs/getting-started-vscode) for ease of use.

Additionally, a helpful set of example end-to-end tests can be found in [this directory](https://github.com/GuardianUI/GuardianTest/tree/main/test-examples).

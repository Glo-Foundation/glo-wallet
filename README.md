# Glo wallet by [glodollar.org](https://glodollar.org)

Welcome! The Glo Wallet is a web3 dApp created by the Glo Foundation that seeks to fulfill three purposes:
1. **Be the entry point** for joining the Glo Dollar Movement
2. **Minimize friction** for crypto newcomers to buy the Glo Dollar and start using it to pay for things in the real world
3. **Activate the Community** to help grow the Glo Dollar Movement by completing specific Call To Actions

The Glo Wallet leverages the [Sequence wallet](https://sequence.xyz/) for web2 friendly authentication, and is built upon [wagmi](https://github.com/wagmi-dev/wagmi).

## Setup Local Environment for Development

### Environment variables

`cp .env.example .env`

Change the values for your local development (e.g. for running a local PostgreSQL database).

### Run

`npm run dev`

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

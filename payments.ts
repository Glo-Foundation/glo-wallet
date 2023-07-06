const POPUP_PROPS =
  "toolbar=1,scrollbars=1,location=0,statusbar=0,menubar=1,resizable=1,width=900, height=800,top=0";

export const buyWithTransak = (address: string) => {
  const redirectUrl = `${window.location.origin}/purchased`;
  const params = `cryptoCurrencyCode=USDC&networks=polygon&fiatCurrency=USD&fiatAmount=1000&walletAddress=${address}&hideMenu=true&redirectURL=${redirectUrl}`;

  window.open(
    `${process.env.NEXT_PUBLIC_TRANSAK_URL}&${params}`,
    "twitter-oauth2",
    POPUP_PROPS
  );
};

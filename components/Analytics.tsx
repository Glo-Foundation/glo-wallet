import Script from "next/script";

export default function Analytics() {
  return (
    <>
      <Script
        src="/pl/js/script.js"
        data-domain="app.glodollar.org"
        data-api="/pl/api/event"
        defer
      />
    </>
  );
}

export default function BuyGloModal({ close }: { close: () => void }) {
  return (
    <main className="max-w-sm">
      <h1 className="text-2xl font-bold">Coming soon</h1>
      <br />
      <p className="text-pine-700">
        Glo is currently in beta. As soon as you can buy Glo, we&apos;ll let you
        know via email.
      </p>
    </main>
  );
}

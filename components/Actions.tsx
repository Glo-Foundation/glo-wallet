export default function Actions() {
  return (
    <nav className="mb-9">
      <div className="flex flex-col">
        <button onClick={() => disconnect()}>[Disconnect]</button>
        <div>
          {address?.slice(0, 5)}...
          {address?.slice(-3)}
        </div>
        <div>
          {balance?.formatted} {balance?.symbol}
        </div>
        <button onClick={() => buy()}>[Buy Glo]</button>
        <button onClick={() => transfer()}>[Transfer]</button>
        <button onClick={() => scan()}>[Scan]</button>
        <button onClick={() => receive()}>[Receive]</button>
      </div>
      ) : (
      <button onClick={() => connect({ connector: connectors[0] })}>
        [Connect]
      </button>
    </nav>
  );
}

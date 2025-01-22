import { useEffect } from "react";
import { useConnect } from "wagmi";

const AUTOCONNECTED_CONNECTOR_IDS = ["safe"];

function useAutoConnect(isSafe: boolean) {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (!isSafe) {
      return;
    }
    AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
      const connectorInstance = connectors.find((c) => c.id === connector);

      if (connectorInstance) {
        connect({ connector: connectorInstance });
      }
    });
  }, [connect, connectors]);
}

export { useAutoConnect };

import { createWeb3Auth, modalConfig } from "@/lib/web3uath";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import Image from "next/image";
import { useEffect, useState } from "react";
import Web3 from "web3";

export default function Navbar() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [balance, setBalance] = useState<string>();
  const [wallet, setWallet] = useState<string>();

  useEffect(() => {
    async function init() {
      try {
        const web3auth = createWeb3Auth();
        setWeb3auth(web3auth);

        await web3auth.initModal(modalConfig);
        if (web3auth.provider) {
          setProvider(web3auth.provider);
        }
      } catch (error) {
        console.error(error);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const fetchUserWallet = async () => {
      if (!provider) {
        console.log("provider not initialized yet");
        return;
      }
      const web3 = new Web3(provider as any);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length < 1) {
        return;
      }
      const account = accounts[0];
      const balance = await web3.eth.getBalance(account);
      setWallet(account);
      setBalance(web3.utils.fromWei(balance));
    };
    fetchUserWallet();
  }, [provider]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  return (
    <nav className="mb-9">
      <a href="https://glodollar.org/">
        <Image src="/glo-logo.svg" alt="glo logo" width={74} height={26} />
      </a>
      {!web3auth ? null : provider ? (
        <>
          <button onClick={logout}>[Logout]</button>
          <div>
            {wallet?.slice(0, 5)}...
            {wallet?.slice(-3)}
          </div>
          <div>{balance}</div>
        </>
      ) : (
        <button onClick={login}>[Connect]</button>
      )}
    </nav>
  );
}

import {
  getUserInfo,
  isAllowed,
  setAllowed,
  signTransaction,
  signBlob,
} from "@stellar/freighter-api";
import { RefObject, useEffect, useState } from "react";

export const useOutsideClick = (ref: RefObject<HTMLElement>, callback: any) => {
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
};

export function useFreighter() {
  const isFreighterConnected = JSON.parse(
    localStorage.getItem("freighterConnected") || "false"
  );

  const freighterAddress = localStorage.getItem("freighterAddress");

  const retrieveUserInfo = async () => {
    let userInfo: any = { publicKey: "" };
    let error = "";

    try {
      userInfo = await getUserInfo();
    } catch (e: any) {
      error = e;
    }

    if (error) {
      return error;
    }

    if (!userInfo.publicKey) {
      // we didn't get anything back. Maybe the app hasn't been authorixed?

      const isAccessAllowed = await isAllowed();

      if (!isAccessAllowed) {
        // oh, we forgot to make sure the app is allowed. Let's do that now
        await setAllowed();

        // now, let's try getting that user info again
        // it should work now that this app is "allowed"
        userInfo = await getUserInfo();
      }
    }
    if (userInfo.publicKey == "") {
      alert("Please unlock your Freighter wallet and then reconnect.");
    }

    return userInfo;
  };

  async function connectFreighter() {
    const userInfo = await retrieveUserInfo();
    const publicKey = userInfo.publicKey;
    localStorage.setItem("freighterAddress", publicKey);
    localStorage.setItem("freighterConnected", "true");
  }

  async function disconnectFreighter() {
    localStorage.setItem("freighterAddress", "");
    localStorage.setItem("freighterConnected", "false");
  }

  return {
    isFreighterConnected,
    freighterAddress,
    connectFreighter,
    disconnectFreighter,
  };
}

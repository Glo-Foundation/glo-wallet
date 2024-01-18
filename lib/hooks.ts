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
  const [isFreighterConnected, setIsFreighterConnected] = useState(
    JSON.parse(localStorage.getItem("freighterConnected"))
  );

  useEffect(() => {
    console.log("current freighterConnected value: ", isFreighterConnected);
  }, [isFreighterConnected]);

  function connectFreighter() {
    localStorage.setItem("freighterConnected", "true");
    setIsFreighterConnected(true);
  }

  function disconnectFreighter() {
    localStorage.setItem("freighterConnected", "false");
    setIsFreighterConnected(false);
  }

  return { isFreighterConnected, connectFreighter, disconnectFreighter };
}

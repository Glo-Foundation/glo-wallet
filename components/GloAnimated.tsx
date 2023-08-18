import { useLottie } from "lottie-react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import gloAnimation from "../public/glo-animation.json";

const style = {
  height: 16,
  width: 16,
};

const options = {
  animationData: gloAnimation,
  loop: true,
  autoplay: false,
};

const GloAnimated = () => {
  const { isConnected } = useAccount();

  const { View, play } = useLottie(options, style);

  useEffect(() => {
    if (isConnected) {
      play();
    }
  }, [isConnected]);

  return View;
};

export default GloAnimated;

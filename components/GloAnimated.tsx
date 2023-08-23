import { useLottie } from "lottie-react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import gloAnimationInverted from "../public/glo-animation-inverted.json";
import gloAnimation from "../public/glo-animation.json";

const style = {
  height: 28,
  width: 28,
};

const commonOptions = {
  loop: true,
  autoplay: false,
};

type Props = {
  totalBalance: number | undefined;
};

const GloAnimated = ({ totalBalance }: Props) => {
  const { isConnected } = useAccount();

  const options = {
    animationData:
      totalBalance && totalBalance > 0 ? gloAnimation : gloAnimationInverted,
    ...commonOptions,
  };

  const { View, play } = useLottie(options, style);

  useEffect(() => {
    if (isConnected) {
      play();
    }
  }, [isConnected]);

  return View;
};

export default GloAnimated;

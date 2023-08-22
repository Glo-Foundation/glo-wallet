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
  gloBalance: { value: number; formatted: string };
};

const GloAnimated = ({ gloBalance }: Props) => {
  const { isConnected } = useAccount();

  const options = {
    animationData: gloBalance.value == 0 ? gloAnimationInverted : gloAnimation,
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

import confetti from "canvas-confetti";
import { motion, useAnimation, useInView } from "framer-motion";
import Cookies from "js-cookie";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const variants = {
  visible: {
    pathLength: 1,
    transition: {
      delay: 1,
      duration: 1.2,
      ease: "easeOut",
      type: "tween",
    },
    opacity: 1,
    scale: [0, 1, 1.2, 1],
  },
  hidden: { pathLength: 0, opacity: 0 },
};

export const CompletedIcon = ({
  name,
  path,
}: {
  name: string;
  path: string;
}) => {
  const [shown, setShown] = useState(false);

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && !shown) {
      setShown(true);
      controls.start("visible");

      const hasBeenPlayed = Cookies.get(name);

      if (!hasBeenPlayed) {
        Cookies.set(name, "1");

        confetti({
          particleCount: 200,
          spread: 70,
          angle: 60,
          startVelocity: 60,
          origin: { y: 0.99, x: 0 },
        });
        confetti({
          particleCount: 200,
          spread: 70,
          angle: 120,
          startVelocity: 60,
          origin: { y: 0.99, x: 1 },
        });
      }
    }
  }, [isInView]);

  return (
    <button className="flex border justify-center min-w-[40px] min-h-[40px] rounded-full bg-cyan-600 relative">
      <Image src={path} width={16} height={16} alt="call to action" />
      <Image
        src="checkmark.svg"
        width={16}
        height={16}
        alt="call to action"
        className="absolute -top-1 -right-1"
      />
    </button>
  );
};

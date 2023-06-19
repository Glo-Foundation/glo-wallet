import confetti from "canvas-confetti";
import { motion, useAnimation, useInView } from "framer-motion";
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

export const AnimatedCheckIcon = () => {
  const [shown, setShown] = useState(false);

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && !shown) {
      setShown(true);
      controls.start("visible");
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
  }, [isInView]);

  return (
    <div className="mr-4 flex items-center border justify-center min-w-[40px] min-h-[40px] rounded-full bg-pine-200">
      <svg
        ref={ref}
        width={16}
        height={16}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 10"
      >
        <motion.path
          variants={variants}
          animate={controls}
          initial="hidden"
          d="M1 5.26667L4.73333 9L12.7333 1"
          stroke="#133D38"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

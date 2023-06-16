import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const variants = {
  visible: {
    pathLength: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut",
      type: "tween",
    },
    backGround: 1,
  },
  hidden: { pathLength: 0 },
};

export const AnimatedCheckIcon = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
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
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
};

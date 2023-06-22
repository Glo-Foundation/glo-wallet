import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api } from "@/lib/utils";

const POPUP_PROPS =
  "toolbar=1,scrollbars=1,location=0,statusbar=0,menubar=1,resizable=1,width=900, height=800,top=0";
const BUTTON_CLASS_NAME = "bg-pine-100 text-pine-900 h-[52px] py-3.5 m-1 p-10";

const TwitterLogo = () => (
  <Image className="mr-3" alt="" src="/twitter.svg" height={32} width={32} />
);

export default function TweetModal({ tweetText }: { tweetText: string }) {
  const { closeModal } = useContext(ModalContext);
  const { ctas, setCTAs } = useUserStore();

  const [tweetVerified, setTweetVerified] = useState(false);

  useEffect(() => {
    const isCompleted = ctas.find(
      (x) => x.type === "TWEEET_IMPACT" && x.isCompleted
    );
    if (isCompleted) {
      setTweetVerified(true);
    }
  }, []);

  const verify = () => {
    const bc = new BroadcastChannel("glo-channel");
    bc.onmessage = (event) => {
      console.log("Popup closed");

      const { success } = event.data;

      if (success) {
        api()
          .get<CTA[]>(`/ctas`)
          .then((res) => {
            setCTAs(res.data);
            setTweetVerified(true);
          });
      }
    };

    const userId = Cookies.get("glo-user");

    const redirectUri = `${window.location.origin}/oauth2/twitter`;

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}?userId=${userId}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`;

    window.open(authUrl, "twitter-oauth2", POPUP_PROPS);
  };

  const tweet = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "twitter-tweet", POPUP_PROPS);
  };
  return (
    <div className="p-8">
      <div className="flex flex-row justify-between">
        <div></div>
        <button onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="flex flex-col items-center">
        <h2>Two steps:</h2>
        <button onClick={() => tweet()} className={BUTTON_CLASS_NAME}>
          <TwitterLogo />
          1. Post Tweet
        </button>
        <button
          disabled={tweetVerified}
          onClick={() => verify()}
          className={BUTTON_CLASS_NAME}
        >
          <TwitterLogo />
          2. Verify Tweet
        </button>
      </section>
    </div>
  );
}

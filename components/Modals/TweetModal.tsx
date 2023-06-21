import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useState } from "react";

import { ModalContext } from "@/lib/context";
import { useUserStore } from "@/lib/store";
import { api } from "@/lib/utils";

const POPUP_PROPS =
  "toolbar=1,scrollbars=1,location=0,statusbar=0,menubar=1,resizable=1,width=900, height=800,top=0";

export default function TweetModal({ tweetText }: { tweetText: string }) {
  const { closeModal } = useContext(ModalContext);
  const { setCTAs } = useUserStore();

  const [tweetVerified, setTweetVerified] = useState(false);

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

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI}?userId=${userId}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`;

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
        <button onClick={() => tweet()}>Tweet</button>
        <button onClick={() => verify()}>
          {tweetVerified ? "Verified!" : "Verify"}
        </button>
      </section>
    </div>
  );
}

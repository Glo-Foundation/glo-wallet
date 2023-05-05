import Image from "next/image";
import React, { useState } from "react";

type Props = {
  isIframe: boolean;
};

export default function JoinTheMovement({ isIframe }: Props) {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();

    const target = event.target as typeof event.target & {
      email: { value: string };
    };

    const email = target.email.value;

    try {
      const emailSubmitEndpoint = process.env.NEXT_PUBLIC_EMAIL_SUBMIT_URL;
      if (!emailSubmitEndpoint) {
        setError("Failed to submit email");
        console.error("Failed to submit email", "No email submit url");
        return;
      }

      await fetch(emailSubmitEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      setIsEmailSubmitted(true);
    } catch (error) {
      setError("Failed to submit email");
      console.error("Failed to submit email", error);
      setIsEmailSubmitted(false);
    }
  };

  const getEmailSubmitForm = () => {
    return (
      <form onSubmit={onEmailSubmit}>
        <div className="flex flex-row justify-between h-12 rounded-full w-full bg-white">
          <input
            className="rounded-full px-6 py-3 w-full"
            placeholder="Email"
            type="email"
            id="email"
            name="email"
            required
          />
          <button
            className="shrink-0 bg-cyan-600 rounded-full w-8 h-8 mt-2 mx-2 pl-2"
            type="submit"
          >
            <Image
              width={16}
              height={32}
              style={{ width: "auto" }}
              src="/arrow-right.svg"
              alt="arrow-right-icon"
            />
          </button>
        </div>
      </form>
    );
  };

  if (isIframe) {
    return (
      <div className="flex flex-col space-y-2">
        {isEmailSubmitted ? (
          <div>Your email has been submitted</div>
        ) : (
          <>
            {getEmailSubmitForm()}
            {error && <div className="text-red-900">{error}</div>}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 bg-pine-400 rounded-[20px] py-8 px-6">
      <div className="font-semibold text-3xl">Join the movement</div>
      {isEmailSubmitted ? (
        <div>Your email has been submitted</div>
      ) : (
        <>
          {getEmailSubmitForm()}
          {error && <div className="text-red-900">{error}</div>}
        </>
      )}
    </div>
  );
}

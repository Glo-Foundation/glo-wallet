import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AuthorizeTwitter() {
  const { query } = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { id } = query;

  // Fallback in case window is not closed automagically
  return isLoading ? (
    <div>Authorizing...</div>
  ) : (
    <div onClick={() => window.close()}>Click close to continue</div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { GUEST_COOKIE } from "@/lib/constants";

/**
 * Guest-session hook.
 *
 * The original SPA tracked guest mode purely in localStorage. In the App Router
 * the server also needs to know (to allow guests past the dashboard route
 * guard), so we mirror the flag into a cookie the server/middleware can read.
 * Guest *data* (links/clicks) still lives only in localStorage — never persisted.
 */
export function useGuest() {
  const [isGuest, setIsGuest] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsGuest(document.cookie.includes(`${GUEST_COOKIE}=1`));
    setReady(true);
  }, []);

  const setGuest = useCallback((value: boolean) => {
    if (value) {
      // 30-day cookie, readable by the server route guard.
      document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } else {
      document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
    }
    setIsGuest(value);
  }, []);

  return { isGuest, setGuest, ready };
}

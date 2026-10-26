"use client";

import { useCallback, useEffect, useState } from "react";

export function usePlayerOverlay(
  isPlaying: boolean,
  pinned: boolean,
  hideDelay: number,
) {
  const [active, setActive] = useState(true);
  const [activity, setActivity] = useState(0);
  const reveal = useCallback(() => {
    setActive(true);
    setActivity((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!isPlaying || pinned) return;
    const timer = window.setTimeout(
      () => setActive(false),
      Math.max(500, Number.isFinite(hideDelay) ? hideDelay : 2800),
    );
    return () => window.clearTimeout(timer);
  }, [isPlaying, pinned, activity, hideDelay]);

  return { visible: !isPlaying || pinned || active, reveal };
}

"use client";

/** `useToggle` — tiny boolean state with functional variants. */

import { useCallback, useState } from "react";

export function useToggle(initialValue = false): {
  isOn: boolean;
  on: () => void;
  off: () => void;
  toggle: () => void;
  set: (value: boolean) => void;
} {
  const [isOn, setIsOn] = useState(initialValue);

  const on = useCallback(() => setIsOn(true), []);
  const off = useCallback(() => setIsOn(false), []);
  const toggle = useCallback(() => setIsOn((prev) => !prev), []);
  const set = useCallback((value: boolean) => setIsOn(value), []);

  return { isOn, on, off, toggle, set };
}

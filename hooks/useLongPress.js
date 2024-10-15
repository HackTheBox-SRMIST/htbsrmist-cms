import { useCallback, useRef } from "react";

export default function useLongPress(callback, ms = 500) {
  const timerRef = useRef(0);

  const endTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = 0;
  };

  const onStartLongPress = useCallback(
    (e) => {
      endTimer();

      timerRef.current = window.setTimeout(() => {
        callback();
        endTimer();
      }, ms);
    },
    [callback, ms]
  );

  const onEndLongPress = useCallback(() => {
    if (timerRef.current) {
      endTimer();
      callback();
    }
  }, [callback]);

  return [onStartLongPress, onEndLongPress, endTimer];
}

import { useEffect, useState, useRef } from "react";

export function useAnalyserData(
  analyserRef: React.RefObject<AnalyserNode | null>,
  isPlaying: boolean,
  ready = true
) {
  const [data, setData] = useState<Uint8Array | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!ready) return;
    const analyser = analyserRef.current;
    if (!analyser) return;

    const len = analyser.frequencyBinCount;
    const arr = new Uint8Array(len);

    const tick = () => {
      analyser.getByteFrequencyData(arr);
      setData(new Uint8Array(arr));
      frameRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [analyserRef, isPlaying, ready]);

  return data;
}

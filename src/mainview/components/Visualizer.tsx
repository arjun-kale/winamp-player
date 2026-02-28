import { useMemo } from "react";
import { useAudioEngineContext } from "../context/AudioEngineContext";
import { useAnalyserData } from "../hooks/useAnalyserData";
import { usePlayerStore } from "../store/playerStore";
import { VISUALIZER_DATA } from "../data/mock";

type VisualizerProps = {
  count?: number;
  heightClass?: string;
  isPlaying?: boolean;
};

function downsampleFrequencyData(data: Uint8Array, targetCount: number): number[] {
  if (data.length === 0) return [];
  const step = data.length / targetCount;
  const result: number[] = [];
  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    let sum = 0;
    for (let j = start; j < end && j < data.length; j++) sum += data[j];
    result.push(sum / (end - start || 1));
  }
  return result;
}

export function Visualizer({ count = 120, heightClass = "h-12", isPlaying = true }: VisualizerProps) {
  const { analyserRef, analyserReady } = useAudioEngineContext();
  const frequencyData = useAnalyserData(analyserRef, isPlaying, analyserReady);
  const storeIsPlaying = usePlayerStore((s) => s.player.isPlaying);

  const heights = useMemo(() => {
    if (frequencyData && frequencyData.length > 0 && storeIsPlaying) {
      const sampled = downsampleFrequencyData(frequencyData, count);
      const max = Math.max(...sampled, 1);
      return sampled.map((v) => Math.max(15, (v / max) * 100));
    }
    return null;
  }, [frequencyData, count, storeIsPlaying]);

  if (heights) {
    return (
      <>
        {heights.map((h, i) => (
          <div
            key={i}
            className={`w-2 bg-winamp-bar ${heightClass} visualizer-bar`}
            style={{ height: `${h}%` }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {VISUALIZER_DATA.slice(0, count).map((data, i) => (
        <div
          key={i}
          className={`w-2 bg-winamp-bar ${heightClass} visualizer-bar`}
          style={{
            height: `${data.height}%`,
            animationDelay: `${data.delay}s`,
            animationDuration: `${data.duration}s`,
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />
      ))}
    </>
  );
}

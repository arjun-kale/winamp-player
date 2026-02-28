import { VISUALIZER_DATA } from "../data/mock";

type VisualizerProps = {
  count?: number;
  heightClass?: string;
  isPlaying?: boolean;
};

export function Visualizer({ count = 120, heightClass = "h-12", isPlaying = true }: VisualizerProps) {
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

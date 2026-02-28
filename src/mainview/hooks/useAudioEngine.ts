import { useEffect, useRef, useCallback, useState } from "react";
import { usePlayerStore } from "../store/playerStore";

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const {
    player,
    rpc,
    setCurrentTime,
    setPlaybackUrl,
    playTrack,
    setVolume,
    getQueueFromLibrary,
  } = usePlayerStore();

  const handleEnded = useCallback(() => {
    const { queue, currentTrack } = usePlayerStore.getState().player;
    if (queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const next = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : queue[0];
    if (next) playTrack(next, queue);
  }, [playTrack]);

  const handleTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (el) setCurrentTime(el.currentTime);
  }, [setCurrentTime]);

  const handleError = useCallback(() => {
    setPlaybackUrl(null);
    usePlayerStore.getState().togglePlay();
  }, [setPlaybackUrl]);

  useEffect(() => {
    const el = document.createElement("audio");
    el.preload = "metadata";
    audioRef.current = el;
    el.addEventListener("ended", handleEnded);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("error", handleError);
    return () => {
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("error", handleError);
      el.pause();
      el.src = "";
      audioRef.current = null;
      if (analyserRef.current) {
        try {
          analyserRef.current.context.close();
        } catch {}
        analyserRef.current = null;
      }
    };
  }, [handleEnded, handleTimeUpdate, handleError]);

  useEffect(() => {
    if (!player.currentTrack || !rpc) return;

    const loadAndPlay = async () => {
      const url = await rpc.request.getPlaybackUrl({ path: player.currentTrack!.path });
      setPlaybackUrl(url);
      const el = audioRef.current;
      if (!el) return;
      el.volume = player.volume;
      el.src = url;
      el.currentTime = player.currentTime;
      el.play().catch(handleError);
    };

    loadAndPlay();
  }, [player.currentTrack?.id, rpc]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = player.volume;
    if (player.isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [player.isPlaying, player.volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (el && Math.abs(el.currentTime - player.currentTime) > 0.05) {
      el.currentTime = player.currentTime;
    }
  }, [player.currentTime]);

  const [analyserReady, setAnalyserReady] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
    setAnalyserReady(true);

    return () => {
      ctx.close();
      analyserRef.current = null;
      setAnalyserReady(false);
    };
  }, []);

  return { audioRef, analyserRef, analyserReady };
}

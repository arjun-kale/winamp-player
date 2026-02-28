import { createContext, useContext, type ReactNode } from "react";

const AudioEngineContext = createContext<{
  analyserRef: React.RefObject<AnalyserNode | null>;
  analyserReady: boolean;
} | null>(null);

export function AudioEngineProvider({
  analyserRef,
  analyserReady,
  children,
}: {
  analyserRef: React.RefObject<AnalyserNode | null>;
  analyserReady: boolean;
  children: ReactNode;
}) {
  return (
    <AudioEngineContext.Provider value={{ analyserRef, analyserReady }}>
      {children}
    </AudioEngineContext.Provider>
  );
}

export function useAudioEngineContext() {
  const ctx = useContext(AudioEngineContext);
  return {
    analyserRef: ctx?.analyserRef ?? { current: null },
    analyserReady: ctx?.analyserReady ?? false,
  };
}

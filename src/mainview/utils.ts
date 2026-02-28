export const parseTime = (timeStr: string): number => {
  const [min, sec] = timeStr.split(":").map(Number);
  return min * 60 + sec;
};

export const formatTime = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

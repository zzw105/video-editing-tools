export interface FFmpegMessageType {
  frame: string;
  fps: string;
  q: string;
  size: string;
  time: string;
  bitrate: string;
  speed: string;
}

export const formatFFmpegMessage = (message: string) => {
  const trimMessage = message
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join("");

  const dataArr = trimMessage.split(
    /frame=|fps=|q=|size=|time=|bitrate=|speed=/
  );
  dataArr.shift();

  const [frame, fps, q, size, time, bitrate, speed] = dataArr;
  return { frame, fps, q, size, time, bitrate, speed };
};

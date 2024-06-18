export interface FFmpegMessageCutType {
  frame: string;
  fps: string;
  q: string;
  size: string;
  time: string;
  bitrate: string;
  speed: string;
}
export interface FFmpegMessageMergeType {
  size: string;
  time: string;
  bitrate: string;
  speed: string;
}

export function formatFFmpegMessage(
  message: string,
  type: "cut"
): FFmpegMessageCutType;
export function formatFFmpegMessage(
  message: string,
  type: "merge"
): FFmpegMessageMergeType;

export function formatFFmpegMessage(message: string, type: "cut" | "merge") {
  const trimMessage = message
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join("");

  const dataArr = trimMessage.split(
    /frame=|fps=|q=|size=|time=|bitrate=|speed=/
  );
  dataArr.shift();
  let frame, fps, q, size, time, bitrate, speed;

  switch (type) {
    case "cut":
      [frame, fps, q, size, time, bitrate, speed] = dataArr;
      return { frame, fps, q, size, time, bitrate, speed };
    case "merge":
      console.log(dataArr);

      [size, time, bitrate, speed] = dataArr;
      return { size, time, bitrate, speed };
    default:
      return {};
  }
}

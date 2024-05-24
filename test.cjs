const str =
  "frame=706fps=55q=29.0size=5120kBtime=00:00:25.91bitrate=1618.6kbits/sspeed=2.02x";
// const arr = str.split([
//   "frame=",
//   "fps=",
//   "q=",
//   "size=",
//   "time=",
//   "bitrate=",
//   "speed=",
// ]);
const arr = str.split(/frame=|fps=|q=|size=|time=|bitrate=|speed=/);
arr.shift();
const [frame, fps, q, size, time, bitrate, speed] = arr;
const obj = { frame, fps, q, size, time, bitrate, speed };
console.log(obj);

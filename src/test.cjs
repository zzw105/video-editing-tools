const str =
  "frame=   80 fps= 39 q=29.0 size=     512kB time=00:00:05.06 bitrate= 828.7kbits/s speed=2.46x    ";

console.log(
  str
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join("")
);

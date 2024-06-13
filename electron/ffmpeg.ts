import { spawn } from "child_process";
import path from "path";
import { win } from "./main";
import log from "electron-log/main";
import { ChildProcessWithoutNullStreams } from "child_process";
// 执行命令
// const ffmpegProcess = spawn(
//   `${ffmpegPath} -ss ${startTime} -t ${endTime} -i ${sourceFilePath} -c:v libx264 -c:a aac -strict experimental -b:a 98k ${outFilePath} -y`
// );

export interface cutVideoParameterType {
  sourceFilePath: string;
  outFilePath: string;
  startTime: string;
  endTime: string;
}

let ffmpegProcess: ChildProcessWithoutNullStreams | null;

export const cutVideo = (parameter: cutVideoParameterType) => {
  const { sourceFilePath, outFilePath, startTime, endTime } = parameter;

  // const outFilePath = path.join(
  //   path.dirname(sourceFilePath),
  //   `${outFileName}.mp4`
  // );
  // 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
  const ffmpegPath = path.join(
    process.env.VITE_PUBLIC,
    "/ffmpeg/bin/ffmpeg.exe"
  );

  ffmpegProcess = spawn(ffmpegPath, [
    "-ss",
    startTime,
    "-t",
    endTime,
    "-i",
    sourceFilePath,
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-strict",
    "experimental",
    "-b:a",
    "98k",
    outFilePath,
    "-y",
  ]);

  ffmpegProcess.stdout.on("data", (data: string) => {
    const buffer = Buffer.from(data);
    const string = buffer.toString("utf8");
    log.info(string);
  });

  ffmpegProcess.stderr.on("data", (data: string) => {
    const buffer = Buffer.from(data);
    const string = buffer.toString("utf8");
    win?.webContents.send("main-process-message", string);
    log.info(string);
  });

  ffmpegProcess.on("close", (code: string) => {
    log.info(`子进程退出，退出码 ${code}`);
  });
};

export const killFFmpegProcess = () => {
  ffmpegProcess?.kill("SIGINT");
};
// ffmpeg -f concat -safe 0 -i 111.txt -c copy -y output.mp4
// file 'C:/Users/zzw13/Documents/WeChat Files/wxid_ml00dgoc7t4h22/FileStorage/File/2024-06/党章 1改/党章 1改/6.mp4'
// file 'C:/Users/zzw13/Downloads/test/7.mp4'

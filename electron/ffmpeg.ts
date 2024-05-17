import { spawn } from "child_process";
import { ipcMain } from "electron";
import path from "path";
import { win } from "./main";

// 执行命令
// const ffmpegProcess = spawn(
//   `${ffmpegPath} -ss ${startTime} -t ${endTime} -i ${sourceFilePath} -c:v libx264 -c:a aac -strict experimental -b:a 98k ${outFilePath} -y`
// );

export interface cutVideoParameterType {
  sourceFilePath: string;
  outFileName: string;
  startTime: string;
  endTime: string;
}

export const cutVideo = (parameter: cutVideoParameterType) => {
  const { sourceFilePath, outFileName, startTime, endTime } = parameter;

  const outFilePath = path.join(
    path.dirname(sourceFilePath),
    `${outFileName}.mp4`
  );
  // 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
  const ffmpegPath = path.join(
    process.env.VITE_PUBLIC,
    "/ffmpeg/bin/ffmpeg.exe"
  );

  const ffmpegProcess = spawn(ffmpegPath, [
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
    console.log(`stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data: string) => {
    console.log(`stderr: ${data}`);
    const buffer = Buffer.from(data);
    const string = buffer.toString("utf8");
    win?.webContents.send("main-process-message", string);
  });

  ffmpegProcess.on("close", (code: string) => {
    console.log(`子进程退出，退出码 ${code}`);
  });
};

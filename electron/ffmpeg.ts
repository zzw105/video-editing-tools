import { spawn } from "child_process";
import path from "path";
import { win } from "./main";
import log from "electron-log/main";
import { ChildProcessWithoutNullStreams } from "child_process";
import fs from "node:fs/promises";
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

export interface mergeParameterType {
  filePathList: string[];
  outFilePath: string;
}

export const mergeVideo = async (parameter: mergeParameterType) => {
  const { filePathList, outFilePath } = parameter;
  const fileListTextPath = path.join(process.env.VITE_PUBLIC, "fileList.txt");
  // fs.writeFile('date.txt', `file '${sourceFilePath}'\nfile '${outFilePath}'`, {flag: 'a'}, (err) => {

  // });
  await fs.writeFile(
    fileListTextPath,
    filePathList.map((filePath) => `file '${filePath}'`).join("\n")
  );

  // 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
  const ffmpegPath = path.join(
    process.env.VITE_PUBLIC,
    "/ffmpeg/bin/ffmpeg.exe"
  );
  // ffmpeg -f concat -safe 0 -i 111.txt -c copy -y output.mp4
  ffmpegProcess = spawn(ffmpegPath, [
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    fileListTextPath,
    "-c",
    "copy",
    "-y",
    outFilePath,
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

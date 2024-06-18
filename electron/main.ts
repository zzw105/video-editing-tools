import { app, BrowserWindow, ipcMain, protocol, shell, dialog } from "electron";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { cutVideo, killFFmpegProcess, mergeVideo } from "./ffmpeg";
// log工具
import log from "electron-log/main";
import dayjs from "dayjs";
import { deleteOldFiles } from "./utils";

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

export let win: BrowserWindow | null;

deleteOldFiles(path.join(process.env.VITE_PUBLIC, "logs"));

log.initialize();
// 配置日志
log.transports.file.resolvePathFn = () =>
  path.join(process.env.VITE_PUBLIC, `logs/${dayjs().format("YYYYMMDD")}.log`);
log.info("Log from the main process");

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // 隐藏菜单
  win.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // 开发阶段打开开发者工具
    win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // 开启ffmpeg裁剪进程
  ipcMain.handle("cut", (_e, parameter) => {
    cutVideo(parameter);
  });
  // 开启ffmpeg合并
  ipcMain.handle("merge", (_e, parameter) => {
    mergeVideo(parameter);
  });
  // 停止ffmpeg进程
  ipcMain.handle("kill", () => {
    killFFmpegProcess();
  });
  ipcMain.handle("file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.filePaths[0] || "";
  });
  ipcMain.handle("isFileExist", async (_e, file) => {
    try {
      await fs.access(file, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch (err) {
      return false;
    }
  });

  // 打开资源管理器
  ipcMain.handle("openExplorer", (_e, parameter) => {
    let url: string[] = [process.env.VITE_PUBLIC];
    if (parameter === "logs") {
      url = [process.env.VITE_PUBLIC, `logs/${dayjs().format("YYYYMMDD")}.log`];
    } else {
      url = parameter;
    }
    shell.showItemInFolder(path.join(...url));
  });
  // 用于读取本地视频
  protocol.registerFileProtocol("atom", (request, callback) => {
    const url = request.url.substr(7);
    callback(decodeURI(path.normalize(url)));
  });

  createWindow();
});

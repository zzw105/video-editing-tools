import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log/main";

export const deleteOldFiles = async (directoryPath: string) => {
  try {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);
      const createTimestamp = stats.birthtimeMs;
      const currentTimestamp = Date.now();
      const diffDays = Math.floor(
        (currentTimestamp - createTimestamp) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 7) {
        await fs.unlink(filePath); // 删除文件
      }
    }
  } catch (error) {
    log.error("Error deleting old files:", error);
  }
};

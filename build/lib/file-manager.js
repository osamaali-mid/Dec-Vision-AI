"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var file_manager_exports = {};
__export(file_manager_exports, {
  FileManager: () => FileManager
});
module.exports = __toCommonJS(file_manager_exports);
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_events = require("events");
class FileManager extends import_events.EventEmitter {
  constructor(uploadDir = "./uploads", maxFileSize = 100 * 1024 * 1024) {
    super();
    this.uploadDir = uploadDir;
    this.maxFileSize = maxFileSize;
    this.allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".bmp",
      ".tiff",
      // Images
      ".mp4",
      ".avi",
      ".mov",
      ".mkv",
      ".webm"
      // Videos
    ];
    this.ensureUploadDirectory();
  }
  /**
   * Save uploaded file
   */
  async saveFile(fileName, fileBuffer) {
    try {
      const fileExtension = path.extname(fileName).toLowerCase();
      if (!this.allowedExtensions.includes(fileExtension)) {
        return {
          success: false,
          error: `File type not allowed. Supported formats: ${this.allowedExtensions.join(", ")}`
        };
      }
      if (fileBuffer.length > this.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`
        };
      }
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      const filePath = path.join(this.uploadDir, uniqueFileName);
      await fs.promises.writeFile(filePath, fileBuffer);
      const fileInfo = {
        name: fileName,
        size: fileBuffer.length,
        type: this.getFileType(fileExtension),
        uploadedAt: /* @__PURE__ */ new Date()
      };
      this.emit("fileUploaded", { filePath, fileInfo });
      return {
        success: true,
        filePath,
        fileInfo
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save file: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Get list of uploaded files
   */
  async getUploadedFiles() {
    try {
      const files = await fs.promises.readdir(this.uploadDir);
      const fileList = [];
      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
          const fileExtension = path.extname(file).toLowerCase();
          fileList.push({
            name: file,
            path: filePath,
            size: stats.size,
            type: this.getFileType(fileExtension),
            uploadedAt: stats.mtime
          });
        }
      }
      return fileList.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      this.emit("error", error);
      return [];
    }
  }
  /**
   * Delete uploaded file
   */
  async deleteFile(fileName) {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.emit("fileDeleted", { fileName, filePath });
        return true;
      }
      return false;
    } catch (error) {
      this.emit("error", error);
      return false;
    }
  }
  /**
   * Clean up old files (older than specified days)
   */
  async cleanupOldFiles(daysOld = 7) {
    try {
      const files = await fs.promises.readdir(this.uploadDir);
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile() && stats.mtime < cutoffDate) {
          await fs.promises.unlink(filePath);
          deletedCount++;
          this.emit("fileDeleted", { fileName: file, filePath, reason: "cleanup" });
        }
      }
      this.emit("cleanupComplete", { deletedCount, daysOld });
      return deletedCount;
    } catch (error) {
      this.emit("error", error);
      return 0;
    }
  }
  /**
   * Get file type from extension
   */
  getFileType(extension) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
    if (imageExtensions.includes(extension)) {
      return "image";
    } else if (videoExtensions.includes(extension)) {
      return "video";
    }
    return "unknown";
  }
  /**
   * Ensure upload directory exists
   */
  ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
  /**
   * Get upload directory path
   */
  getUploadDirectory() {
    return this.uploadDir;
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.uploadDir) {
      this.uploadDir = config.uploadDir;
      this.ensureUploadDirectory();
    }
    if (config.maxFileSize) {
      this.maxFileSize = config.maxFileSize;
    }
    if (config.allowedExtensions) {
      this.allowedExtensions = config.allowedExtensions;
    }
    this.emit("configUpdated", {
      uploadDir: this.uploadDir,
      maxFileSize: this.maxFileSize,
      allowedExtensions: this.allowedExtensions
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileManager
});
//# sourceMappingURL=file-manager.js.map

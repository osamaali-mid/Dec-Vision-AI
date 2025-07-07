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
var detection_service_exports = {};
__export(detection_service_exports, {
  DetectionService: () => DetectionService
});
module.exports = __toCommonJS(detection_service_exports);
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_events = require("events");
class DetectionService extends import_events.EventEmitter {
  constructor(config) {
    super();
    this.isProcessing = false;
    this.supportedImageFormats = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"];
    this.supportedVideoFormats = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
    this.config = config;
  }
  /**
   * Process image file for detection
   */
  async processImage(imagePath) {
    if (!this.config.enableImageDetection) {
      throw new Error("Image detection is disabled");
    }
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    const fileExtension = path.extname(imagePath).toLowerCase();
    if (!this.supportedImageFormats.includes(fileExtension)) {
      throw new Error(`Unsupported image format: ${fileExtension}`);
    }
    const fileStats = fs.statSync(imagePath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    if (fileSizeMB > this.config.maxFileSize) {
      throw new Error(`File size exceeds limit: ${fileSizeMB}MB > ${this.config.maxFileSize}MB`);
    }
    this.isProcessing = true;
    this.emit("processingStarted", { type: "image", path: imagePath });
    try {
      const results = await this.performDetection(imagePath, "image");
      this.emit("detectionComplete", {
        type: "image",
        path: imagePath,
        results
      });
      return results;
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Process video file for detection
   */
  async processVideo(videoPath) {
    if (!this.config.enableVideoDetection) {
      throw new Error("Video detection is disabled");
    }
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }
    const fileExtension = path.extname(videoPath).toLowerCase();
    if (!this.supportedVideoFormats.includes(fileExtension)) {
      throw new Error(`Unsupported video format: ${fileExtension}`);
    }
    const fileStats = fs.statSync(videoPath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    if (fileSizeMB > this.config.maxFileSize) {
      throw new Error(`File size exceeds limit: ${fileSizeMB}MB > ${this.config.maxFileSize}MB`);
    }
    this.isProcessing = true;
    this.emit("processingStarted", { type: "video", path: videoPath });
    try {
      const results = await this.performVideoDetection(videoPath);
      this.emit("detectionComplete", {
        type: "video",
        path: videoPath,
        results
      });
      return results;
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Start webcam detection
   */
  async startWebcamDetection(deviceId) {
    if (!this.config.enableWebcamDetection) {
      throw new Error("Webcam detection is disabled");
    }
    this.isProcessing = true;
    this.emit("webcamDetectionStarted", { deviceId });
    this.performContinuousWebcamDetection(deviceId);
  }
  /**
   * Stop webcam detection
   */
  stopWebcamDetection() {
    this.isProcessing = false;
    this.emit("webcamDetectionStopped");
  }
  /**
   * Get available webcam devices
   */
  async getAvailableWebcams() {
    return [
      { id: "0", name: "Default Camera" },
      { id: "1", name: "USB Camera" },
      { id: "reolink", name: "Reolink Camera" }
    ];
  }
  /**
   * Check if detection is currently running
   */
  isDetectionRunning() {
    return this.isProcessing;
  }
  /**
   * Update detection configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", this.config);
  }
  /**
   * Simulate AI detection on image/video frame
   */
  async performDetection(filePath, source) {
    await new Promise((resolve) => setTimeout(resolve, 1e3 + Math.random() * 2e3));
    const results = [];
    const detectionTypes = ["motion", "person", "vehicle", "face", "dog_cat"];
    for (const type of detectionTypes) {
      if (Math.random() > 0.7) {
        const confidence = 0.5 + Math.random() * 0.5;
        if (confidence >= this.config.detectionThreshold) {
          results.push({
            type,
            confidence,
            timestamp: /* @__PURE__ */ new Date(),
            source,
            boundingBox: {
              x: Math.floor(Math.random() * 640),
              y: Math.floor(Math.random() * 480),
              width: 50 + Math.floor(Math.random() * 100),
              height: 50 + Math.floor(Math.random() * 100)
            },
            metadata: {
              filePath,
              processingTime: 1e3 + Math.random() * 2e3
            }
          });
        }
      }
    }
    return results;
  }
  /**
   * Process video file frame by frame
   */
  async performVideoDetection(videoPath) {
    const allResults = [];
    const frameCount = 30;
    for (let frame = 0; frame < frameCount; frame++) {
      this.emit("videoProgress", {
        frame: frame + 1,
        total: frameCount,
        percentage: (frame + 1) / frameCount * 100
      });
      const frameResults = await this.performDetection(videoPath, "video");
      frameResults.forEach((result) => {
        result.metadata = {
          ...result.metadata,
          frameNumber: frame + 1,
          totalFrames: frameCount
        };
      });
      allResults.push(...frameResults);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return allResults;
  }
  /**
   * Continuous webcam detection
   */
  async performContinuousWebcamDetection(deviceId) {
    while (this.isProcessing) {
      try {
        const results = await this.performDetection(`webcam:${deviceId || "0"}`, "video");
        if (results.length > 0) {
          this.emit("webcamDetection", {
            deviceId,
            results,
            timestamp: /* @__PURE__ */ new Date()
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      } catch (error) {
        this.emit("error", error);
        break;
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DetectionService
});
//# sourceMappingURL=detection-service.js.map

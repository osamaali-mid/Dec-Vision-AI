"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var webcam_manager_exports = {};
__export(webcam_manager_exports, {
  WebcamManager: () => WebcamManager
});
module.exports = __toCommonJS(webcam_manager_exports);
var import_events = require("events");
class WebcamManager extends import_events.EventEmitter {
  constructor() {
    super();
    this.activeStreams = /* @__PURE__ */ new Map();
    this.detectionInterval = null;
    this.streamCheckInterval = null;
    this.startStreamMonitoring();
  }
  /**
   * Get available webcam devices
   */
  async getAvailableDevices() {
    const devices = [
      {
        id: "0",
        name: "Default Camera",
        isActive: false,
        resolution: "1920x1080",
        frameRate: 30
      },
      {
        id: "1",
        name: "USB Camera",
        isActive: false,
        resolution: "1280x720",
        frameRate: 25
      },
      {
        id: "reolink",
        name: "Reolink Network Camera",
        isActive: false,
        resolution: "2560x1440",
        frameRate: 30
      }
    ];
    devices.forEach((device) => {
      device.isActive = this.activeStreams.has(device.id);
    });
    return devices;
  }
  /**
   * Start webcam stream
   */
  async startStream(deviceId) {
    try {
      if (this.activeStreams.has(deviceId)) {
        throw new Error(`Stream already active for device ${deviceId}`);
      }
      const stream = {
        deviceId,
        isStreaming: true,
        startTime: /* @__PURE__ */ new Date(),
        frameCount: 0
      };
      this.activeStreams.set(deviceId, stream);
      this.simulateFrameCapture(deviceId);
      this.emit("streamStarted", { deviceId, stream });
      return true;
    } catch (error) {
      this.emit("error", { deviceId, error });
      return false;
    }
  }
  /**
   * Stop webcam stream
   */
  async stopStream(deviceId) {
    try {
      const stream = this.activeStreams.get(deviceId);
      if (!stream) {
        return false;
      }
      stream.isStreaming = false;
      this.activeStreams.delete(deviceId);
      this.emit("streamStopped", { deviceId, stream });
      return true;
    } catch (error) {
      this.emit("error", { deviceId, error });
      return false;
    }
  }
  /**
   * Stop all active streams
   */
  async stopAllStreams() {
    const deviceIds = Array.from(this.activeStreams.keys());
    for (const deviceId of deviceIds) {
      await this.stopStream(deviceId);
    }
  }
  /**
   * Get active streams
   */
  getActiveStreams() {
    return Array.from(this.activeStreams.values());
  }
  /**
   * Check if device is streaming
   */
  isStreaming(deviceId) {
    const stream = this.activeStreams.get(deviceId);
    return stream ? stream.isStreaming : false;
  }
  /**
   * Get stream statistics
   */
  getStreamStats(deviceId) {
    return this.activeStreams.get(deviceId) || null;
  }
  /**
   * Capture frame from active stream
   */
  async captureFrame(deviceId) {
    const stream = this.activeStreams.get(deviceId);
    if (!stream || !stream.isStreaming) {
      return {
        success: false,
        error: `No active stream for device ${deviceId}`
      };
    }
    try {
      const frameData = Buffer.from("simulated-frame-data");
      const timestamp = /* @__PURE__ */ new Date();
      stream.frameCount++;
      stream.lastFrameTime = timestamp;
      this.emit("frameCaptured", { deviceId, frameData, timestamp });
      return {
        success: true,
        frameData,
        timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Set stream resolution
   */
  async setResolution(deviceId, width, height) {
    const stream = this.activeStreams.get(deviceId);
    if (!stream) {
      return false;
    }
    try {
      this.emit("resolutionChanged", {
        deviceId,
        resolution: `${width}x${height}`
      });
      return true;
    } catch (error) {
      this.emit("error", { deviceId, error });
      return false;
    }
  }
  /**
   * Set stream frame rate
   */
  async setFrameRate(deviceId, frameRate) {
    const stream = this.activeStreams.get(deviceId);
    if (!stream) {
      return false;
    }
    try {
      this.emit("frameRateChanged", { deviceId, frameRate });
      return true;
    } catch (error) {
      this.emit("error", { deviceId, error });
      return false;
    }
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    if (this.streamCheckInterval) {
      clearInterval(this.streamCheckInterval);
      this.streamCheckInterval = null;
    }
    this.stopAllStreams();
  }
  /**
   * Simulate frame capture for active streams
   */
  simulateFrameCapture(deviceId) {
    const interval = setInterval(() => {
      const stream = this.activeStreams.get(deviceId);
      if (!stream || !stream.isStreaming) {
        clearInterval(interval);
        return;
      }
      this.captureFrame(deviceId);
    }, 1e3 / 30);
  }
  /**
   * Monitor stream health
   */
  startStreamMonitoring() {
    this.streamCheckInterval = setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      for (const [deviceId, stream] of this.activeStreams) {
        if (stream.lastFrameTime) {
          const timeSinceLastFrame = now.getTime() - stream.lastFrameTime.getTime();
          if (timeSinceLastFrame > 5e3) {
            this.emit("streamUnhealthy", {
              deviceId,
              timeSinceLastFrame,
              stream
            });
          }
        }
      }
    }, 1e4);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WebcamManager
});
//# sourceMappingURL=webcam-manager.js.map

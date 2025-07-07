"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var https = __toESM(require("https"));
var import_detection_service = require("./lib/detection-service");
var import_file_manager = require("./lib/file-manager");
var import_webcam_manager = require("./lib/webcam-manager");
var path = __toESM(require("path"));
class Reolink810a extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "reolink-810a"
    });
    this.reolinkApiClient = null;
    this.pollTimer = null;
    this.webcamOnline = false;
    this.detectionService = null;
    this.fileManager = null;
    this.webcamManager = null;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("objectChange", this.onObjectChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.initializeDetectionServices();
  }
  /**
   * Initialize detection services
   */
  initializeDetectionServices() {
    const detectionConfig = {
      enableImageDetection: true,
      enableVideoDetection: true,
      enableWebcamDetection: true,
      detectionThreshold: 0.7,
      maxFileSize: 100
      // MB
    };
    this.detectionService = new import_detection_service.DetectionService(detectionConfig);
    const uploadDir = path.join(__dirname, "..", "uploads");
    this.fileManager = new import_file_manager.FileManager(uploadDir, 100 * 1024 * 1024);
    this.webcamManager = new import_webcam_manager.WebcamManager();
    this.setupDetectionEventHandlers();
  }
  /**
   * Setup event handlers for detection services
   */
  setupDetectionEventHandlers() {
    if (!this.detectionService || !this.fileManager || !this.webcamManager) return;
    this.detectionService.on("detectionComplete", (data) => {
      this.log.info(`Detection completed for ${data.type}: ${data.results.length} objects detected`);
      this.updateDetectionStates(data.results);
    });
    this.detectionService.on("webcamDetection", (data) => {
      this.log.debug(`Webcam detection: ${data.results.length} objects detected`);
      this.updateDetectionStates(data.results);
    });
    this.detectionService.on("error", (error) => {
      this.log.error(`Detection service error: ${error}`);
    });
    this.fileManager.on("fileUploaded", (data) => {
      this.log.info(`File uploaded: ${data.fileInfo.name}`);
    });
    this.fileManager.on("error", (error) => {
      this.log.error(`File manager error: ${error}`);
    });
    this.webcamManager.on("streamStarted", (data) => {
      this.log.info(`Webcam stream started: ${data.deviceId}`);
    });
    this.webcamManager.on("streamStopped", (data) => {
      this.log.info(`Webcam stream stopped: ${data.deviceId}`);
    });
    this.webcamManager.on("error", (data) => {
      this.log.error(`Webcam manager error for device ${data.deviceId}: ${data.error}`);
    });
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    if (!this.config.Hostname) {
      this.log.error("Hostname / IP of webcam not (yet) set - please check Settings!");
      return;
    }
    if (!this.config.Username) {
      this.log.error("Username not (yet) set - please check Settings!");
      return;
    }
    if (!this.config.Password) {
      this.log.error("Password not (yet) set - please check Settings!");
      return;
    }
    if (!this.config.apiRefreshInterval) {
      this.log.error("Refresh Interval for Motion Detection not (yet) set - please check Settings!");
      return;
    }
    if (!this.config.apiSleepAfterError) {
      this.log.error("Sleep Interval (if webcam is offline) not (yet) set - please check Settings!");
      return;
    }
    this.reolinkApiClient = import_axios.default.create({
      baseURL: `https://${this.config.Hostname}`,
      timeout: 4e3,
      responseType: "json",
      responseEncoding: "binary",
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    await this.setObjectNotExistsAsync("Device", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.Model", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.BuildDay", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.CfgVer", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.Detail", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.DiskNum", {
      type: "state",
      common: {
        name: "",
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.FirmVer", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.Name", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.Serial", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Device.Wifi", {
      type: "state",
      common: {
        name: "",
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.ActiveLink", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.Connected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.DNS-Auto", {
      type: "state",
      common: {
        name: "",
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.DNS-Server01", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.DNS-Server02", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.MAC", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.Gateway", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.IP", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.Mask", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Network.Type", {
      type: "state",
      common: {
        name: "",
        type: "string",
        role: "value",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.MotionDetected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.DogCat", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.DogCat.Detected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.DogCat.Supported", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Face", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Face.Detected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Face.Supported", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.People", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.People.Detected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.People.Supported", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Vehicle", {
      type: "channel",
      common: {
        name: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Vehicle.Detected", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Sensors.Vehicle.Supported", {
      type: "state",
      common: {
        name: "",
        type: "boolean",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection", {
      type: "channel",
      common: {
        name: "Detection Services"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection.ImageDetection", {
      type: "state",
      common: {
        name: "Image Detection Enabled",
        type: "boolean",
        role: "switch",
        read: true,
        write: true,
        def: true
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection.VideoDetection", {
      type: "state",
      common: {
        name: "Video Detection Enabled",
        type: "boolean",
        role: "switch",
        read: true,
        write: true,
        def: true
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection.WebcamDetection", {
      type: "state",
      common: {
        name: "Webcam Detection Enabled",
        type: "boolean",
        role: "switch",
        read: true,
        write: true,
        def: true
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection.LastDetectionTime", {
      type: "state",
      common: {
        name: "Last Detection Time",
        type: "string",
        role: "value.time",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Detection.DetectionCount", {
      type: "state",
      common: {
        name: "Total Detection Count",
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("FileUpload", {
      type: "channel",
      common: {
        name: "File Upload"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("FileUpload.LastUploadedFile", {
      type: "state",
      common: {
        name: "Last Uploaded File",
        type: "string",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("FileUpload.UploadCount", {
      type: "state",
      common: {
        name: "Upload Count",
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Webcam", {
      type: "channel",
      common: {
        name: "Webcam Management"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Webcam.ActiveStreams", {
      type: "state",
      common: {
        name: "Active Streams Count",
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("Webcam.AvailableDevices", {
      type: "state",
      common: {
        name: "Available Devices",
        type: "string",
        role: "json",
        read: true,
        write: false
      },
      native: {}
    });
    this.announceOffline();
  }
  async pollSensors(classInstance) {
    if (classInstance.config.PollMD)
      classInstance.getMdState();
    if (classInstance.config.PollAI)
      classInstance.getAiState();
  }
  async checkConnection(classInstance) {
    classInstance.getLocalLink();
  }
  async announceOffline() {
    if (this.webcamOnline || this.pollTimer === null) {
      this.webcamOnline = false;
      clearInterval(this.pollTimer);
      this.pollTimer = this.setInterval(this.checkConnection, this.config.apiSleepAfterError * 1e3, this);
    }
    await this.setStateAsync("info.connection", { val: false, ack: true });
    await this.setStateAsync("Network.Connected", { val: false, ack: true });
  }
  async announceOnline() {
    if (!this.webcamOnline) {
      this.webcamOnline = true;
      clearInterval(this.pollTimer);
      this.pollTimer = this.setInterval(this.pollSensors, this.config.apiRefreshInterval, this);
      this.getDevinfo();
      this.getLocalLink();
    }
    await this.setStateAsync("info.connection", { val: true, ack: true });
    await this.setStateAsync("Network.Connected", { val: true, ack: true });
  }
  async getDevinfo() {
    if (this.reolinkApiClient) {
      try {
        const DevInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetDevInfo&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
        if (DevInfoValues.status === 200) {
          this.announceOnline();
          const DevValues = DevInfoValues.data[0];
          await this.setStateAsync("Device.BuildDay", { val: DevValues.value.DevInfo.buildDay, ack: true });
          await this.setStateAsync("Device.CfgVer", { val: DevValues.value.DevInfo.cfgVer, ack: true });
          await this.setStateAsync("Device.Detail", { val: DevValues.value.DevInfo.detail, ack: true });
          await this.setStateAsync("Device.DiskNum", { val: DevValues.value.DevInfo.diskNum, ack: true });
          await this.setStateAsync("Device.FirmVer", { val: DevValues.value.DevInfo.firmVer, ack: true });
          await this.setStateAsync("Device.Model", { val: DevValues.value.DevInfo.model, ack: true });
          await this.setStateAsync("Device.Name", { val: DevValues.value.DevInfo.name, ack: true });
          await this.setStateAsync("Device.Serial", { val: DevValues.value.DevInfo.serial, ack: true });
          await this.setStateAsync("Device.Wifi", { val: DevValues.value.DevInfo.wifi, ack: true });
        }
      } catch (error) {
        this.announceOffline();
        this.log.error("Unable to retrieve DeviceInfo from Webcam [" + this.config.Hostname + "]: " + error);
      }
    }
  }
  async getLocalLink() {
    if (this.reolinkApiClient) {
      try {
        const LinkInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetLocalLink&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
        if (LinkInfoValues.status === 200) {
          this.announceOnline();
          const LinkValues = LinkInfoValues.data[0];
          await this.setStateAsync("Network.ActiveLink", { val: LinkValues.value.LocalLink.activeLink, ack: true });
          await this.setStateAsync("Network.DNS-Auto", { val: LinkValues.value.LocalLink.dns.auto, ack: true });
          await this.setStateAsync("Network.DNS-Server01", { val: LinkValues.value.LocalLink.dns.dns1, ack: true });
          await this.setStateAsync("Network.DNS-Server02", { val: LinkValues.value.LocalLink.dns.dns2, ack: true });
          await this.setStateAsync("Network.MAC", { val: LinkValues.value.LocalLink.mac, ack: true });
          await this.setStateAsync("Network.Gateway", { val: LinkValues.value.LocalLink.static.gateway, ack: true });
          await this.setStateAsync("Network.IP", { val: LinkValues.value.LocalLink.static.ip, ack: true });
          await this.setStateAsync("Network.Mask", { val: LinkValues.value.LocalLink.static.mask, ack: true });
          await this.setStateAsync("Network.Type", { val: LinkValues.value.LocalLink.type, ack: true });
        }
      } catch (error) {
        this.announceOffline();
        this.log.error("Unable to retrieve NetworkInfo from from Webcam [" + this.config.Hostname + "]: " + error);
      }
    }
  }
  async getMdState() {
    if (this.reolinkApiClient && this.config.PollMD) {
      try {
        const MdInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetMdState&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
        if (MdInfoValues.status === 200) {
          this.announceOnline();
          const MdValues = MdInfoValues.data[0];
          await this.setStateAsync("Sensors.MotionDetected", { val: MdValues.value.state === 1, ack: true });
        }
      } catch (error) {
        this.announceOffline();
        this.log.error("Unable to retrieve State of MotionDetection Sensor from from Webcam [" + this.config.Hostname + "]: " + error);
      }
    }
  }
  async getAiState() {
    if (this.reolinkApiClient && this.config.PollAI) {
      try {
        const AiInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetAiState&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
        if (AiInfoValues.status === 200) {
          this.announceOnline();
          const AiValues = AiInfoValues.data[0];
          await this.setStateAsync("Sensors.DogCat.Detected", { val: AiValues.value.dog_cat.alarm_state === 1, ack: true });
          await this.setStateAsync("Sensors.DogCat.Supported", { val: AiValues.value.dog_cat.support === 1, ack: true });
          await this.setStateAsync("Sensors.Face.Detected", { val: AiValues.value.face.alarm_state === 1, ack: true });
          await this.setStateAsync("Sensors.Face.Supported", { val: AiValues.value.face.support === 1, ack: true });
          await this.setStateAsync("Sensors.People.Detected", { val: AiValues.value.people.alarm_state === 1, ack: true });
          await this.setStateAsync("Sensors.People.Supported", { val: AiValues.value.people.support === 1, ack: true });
          await this.setStateAsync("Sensors.Vehicle.Detected", { val: AiValues.value.vehicle.alarm_state === 1, ack: true });
          await this.setStateAsync("Sensors.Vehicle.Supported", { val: AiValues.value.vehicle.support === 1, ack: true });
        }
      } catch (error) {
        this.announceOffline();
        this.log.error("Unable to retrieve State of AI-Detection Sensor from from Webcam [" + this.config.Hostname + "]: " + error);
      }
    }
  }
  /**
   * Update detection states based on results
   */
  async updateDetectionStates(results) {
    if (results.length > 0) {
      await this.setStateAsync("Detection.LastDetectionTime", {
        val: (/* @__PURE__ */ new Date()).toISOString(),
        ack: true
      });
      const currentCount = await this.getStateAsync("Detection.DetectionCount");
      const newCount = ((currentCount == null ? void 0 : currentCount.val) || 0) + results.length;
      await this.setStateAsync("Detection.DetectionCount", {
        val: newCount,
        ack: true
      });
      for (const result of results) {
        switch (result.type) {
          case "motion":
            await this.setStateAsync("Sensors.MotionDetected", {
              val: true,
              ack: true
            });
            break;
          case "person":
            await this.setStateAsync("Sensors.People.Detected", {
              val: true,
              ack: true
            });
            break;
          case "vehicle":
            await this.setStateAsync("Sensors.Vehicle.Detected", {
              val: true,
              ack: true
            });
            break;
          case "face":
            await this.setStateAsync("Sensors.Face.Detected", {
              val: true,
              ack: true
            });
            break;
          case "dog_cat":
            await this.setStateAsync("Sensors.DogCat.Detected", {
              val: true,
              ack: true
            });
            break;
        }
      }
    }
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      this.announceOffline();
      clearInterval(this.pollTimer);
      if (this.detectionService) {
        this.detectionService.stopWebcamDetection();
      }
      if (this.webcamManager) {
        this.webcamManager.cleanup();
      }
      callback();
    } catch (e) {
      callback();
    }
  }
  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  onObjectChange(id, obj) {
    if (obj) {
      this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    } else {
      this.log.info(`object ${id} deleted`);
    }
  }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  */
  onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      switch (obj.command) {
        case "uploadFile":
          this.handleFileUpload(obj);
          break;
        case "processImage":
          this.handleImageProcessing(obj);
          break;
        case "processVideo":
          this.handleVideoProcessing(obj);
          break;
        case "startWebcamDetection":
          this.handleWebcamDetection(obj);
          break;
        case "stopWebcamDetection":
          this.handleStopWebcamDetection(obj);
          break;
        case "getWebcamDevices":
          this.handleGetWebcamDevices(obj);
          break;
        case "getUploadedFiles":
          this.handleGetUploadedFiles(obj);
          break;
        default:
          if (obj.command === "send") {
            this.log.info("send command");
            if (obj.callback) {
              this.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
          }
          break;
      }
    }
  }
  /**
   * Handle file upload message
   */
  async handleFileUpload(obj) {
    try {
      if (!this.fileManager) {
        throw new Error("File manager not initialized");
      }
      const { fileName, fileData } = obj.message;
      const fileBuffer = Buffer.from(fileData, "base64");
      const result = await this.fileManager.saveFile(fileName, fileBuffer);
      if (result.success && result.fileInfo) {
        await this.setStateAsync("FileUpload.LastUploadedFile", {
          val: result.fileInfo.name,
          ack: true
        });
        const currentCount = await this.getStateAsync("FileUpload.UploadCount");
        const newCount = ((currentCount == null ? void 0 : currentCount.val) || 0) + 1;
        await this.setStateAsync("FileUpload.UploadCount", {
          val: newCount,
          ack: true
        });
      }
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, result, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle image processing message
   */
  async handleImageProcessing(obj) {
    try {
      if (!this.detectionService) {
        throw new Error("Detection service not initialized");
      }
      const { imagePath } = obj.message;
      const results = await this.detectionService.processImage(imagePath);
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true, results }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle video processing message
   */
  async handleVideoProcessing(obj) {
    try {
      if (!this.detectionService) {
        throw new Error("Detection service not initialized");
      }
      const { videoPath } = obj.message;
      const results = await this.detectionService.processVideo(videoPath);
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true, results }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle webcam detection start message
   */
  async handleWebcamDetection(obj) {
    try {
      if (!this.detectionService || !this.webcamManager) {
        throw new Error("Detection services not initialized");
      }
      const { deviceId } = obj.message;
      await this.webcamManager.startStream(deviceId || "0");
      await this.detectionService.startWebcamDetection(deviceId);
      const activeStreams = this.webcamManager.getActiveStreams();
      await this.setStateAsync("Webcam.ActiveStreams", {
        val: activeStreams.length,
        ack: true
      });
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle webcam detection stop message
   */
  async handleStopWebcamDetection(obj) {
    try {
      if (!this.detectionService || !this.webcamManager) {
        throw new Error("Detection services not initialized");
      }
      const { deviceId } = obj.message;
      this.detectionService.stopWebcamDetection();
      if (deviceId) {
        await this.webcamManager.stopStream(deviceId);
      } else {
        await this.webcamManager.stopAllStreams();
      }
      const activeStreams = this.webcamManager.getActiveStreams();
      await this.setStateAsync("Webcam.ActiveStreams", {
        val: activeStreams.length,
        ack: true
      });
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle get webcam devices message
   */
  async handleGetWebcamDevices(obj) {
    try {
      if (!this.webcamManager) {
        throw new Error("Webcam manager not initialized");
      }
      const devices = await this.webcamManager.getAvailableDevices();
      await this.setStateAsync("Webcam.AvailableDevices", {
        val: JSON.stringify(devices),
        ack: true
      });
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true, devices }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
  /**
   * Handle get uploaded files message
   */
  async handleGetUploadedFiles(obj) {
    try {
      if (!this.fileManager) {
        throw new Error("File manager not initialized");
      }
      const files = await this.fileManager.getUploadedFiles();
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { success: true, files }, obj.callback);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, errorResult, obj.callback);
      }
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Reolink810a(options);
} else {
  (() => new Reolink810a())();
}
//# sourceMappingURL=main.js.map

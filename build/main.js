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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
const axios = require("axios").default;
const https = require("https");
class Reolink810a extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "reolink-810a"
    });
    this.reolinkApiClient = null;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("objectChange", this.onObjectChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.announceOffline();
    this.announceOnline();
    return;
    if (!this.config.Hostname) {
      this.log.error("Hostname not (yet) set - please check Settings!");
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
    this.reolinkApiClient = axios.create({
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
        type: "boolean",
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
        type: "string",
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
    this.getDevinfo();
    this.getLocalLink();
    if (this.config.PollMD || this.config.PollAI) {
      this.pollTimer = this.setInterval(this.pollSensors, this.config.apiRefreshInterval, this);
    }
  }
  async pollSensors(classInstance) {
    if (classInstance.config.PollMD)
      classInstance.getMdState();
    if (classInstance.config.PollAI)
      classInstance.getAiState();
  }
  async announceOffline() {
    await this.setStateAsync("info.connection", { val: false, ack: true });
    await this.setStateAsync("Network.Connected", { val: false, ack: true });
  }
  async announceOnline() {
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
        this.log.error(error);
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
        this.log.error(error);
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
        this.log.error(error);
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
        this.log.error(error);
      }
    }
  }
  onUnload(callback) {
    try {
      this.announceOffline();
      clearInterval(this.pollTimer);
      callback();
    } catch (e) {
      callback();
    }
  }
  onObjectChange(id, obj) {
    if (obj) {
      this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    } else {
      this.log.info(`object ${id} deleted`);
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "send") {
        this.log.info("send command");
        if (obj.callback)
          this.sendTo(obj.from, obj.command, "Message received", obj.callback);
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

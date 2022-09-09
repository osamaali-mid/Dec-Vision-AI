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
    this.apiConnected = false;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.setState("info.connection", false, true);
    if (!this.config.Hostname) {
      this.log.error("Hostname not (yet )set - please check Settings!");
      return;
    }
    if (!this.config.Username) {
      this.log.error("Username not (yet )set - please check Settings!");
      return;
    }
    if (!this.config.Password) {
      this.log.error("Password not (yet )set - please check Settings!");
      return;
    }
    if (!this.config.apiRefreshInterval) {
      this.log.error("apiRefreshInterval not (yet )set - please check Settings!");
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
    this.getDevinfo();
  }
  async getDevinfo() {
    if (this.reolinkApiClient) {
      try {
        const DevInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetDevInfo&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
        this.log.debug(`camMdStateInfo ${JSON.stringify(DevInfoValues.status)}: ${JSON.stringify(DevInfoValues.data)}`);
        if (DevInfoValues.status === 200) {
          this.apiConnected = true;
          const DevValues = DevInfoValues.data[0];
        }
      } catch (error) {
        this.apiConnected = false;
        await this.setStateAsync("Network.Connected", { val: this.apiConnected, ack: true });
        this.log.error(error);
      }
    }
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Reolink810a(options);
} else {
  (() => new Reolink810a())();
}
//# sourceMappingURL=main.js.map

/*
 * Created with @iobroker/create-adapter v2.2.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
const axios = require("axios").default;
const https = require("https");
import { DetectionService, DetectionConfig, DetectionResult } from './lib/detection-service';
import { FileManager, FileUploadResult } from './lib/file-manager';
import { WebcamManager, WebcamDevice } from './lib/webcam-manager';
import * as path from 'path';

// Load your modules here, e.g.:
// import * as fs from "fs";



class Reolink810a extends utils.Adapter {

    
    private reolinkApiClient : any     = null;
    private pollTimer        : any     = null;
    private webcamOnline     : boolean = false;
    private detectionService : DetectionService | null = null;
    private fileManager      : FileManager | null = null;
    private webcamManager    : WebcamManager | null = null;
    

    public constructor(options: Partial<utils.AdapterOptions> = {})
    {
        super({
            ...options,
            name: 'reolink-810a',
        });


        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));

        // Initialize detection services
        this.initializeDetectionServices();
	}
    
    /**
     * Initialize detection services
     */
    private initializeDetectionServices(): void {
        // Initialize detection service
        const detectionConfig: DetectionConfig = {
            enableImageDetection: true,
            enableVideoDetection: true,
            enableWebcamDetection: true,
            detectionThreshold: 0.7,
            supportedFormats: ['.jpg', '.jpeg', '.png', '.mp4', '.avi', '.mov'],
            maxFileSize: 100 // MB
        };
        
        this.detectionService = new DetectionService(detectionConfig);
        
        // Initialize file manager
        const uploadDir = path.join(__dirname, '..', 'uploads');
        this.fileManager = new FileManager(uploadDir, 100 * 1024 * 1024); // 100MB
        
        // Initialize webcam manager
        this.webcamManager = new WebcamManager();
        
        this.setupDetectionEventHandlers();
    }

    /**
     * Setup event handlers for detection services
     */
    private setupDetectionEventHandlers(): void {
        if (!this.detectionService || !this.fileManager || !this.webcamManager) return;

        // Detection service events
        this.detectionService.on('detectionComplete', (data) => {
            this.log.info(`Detection completed for ${data.type}: ${data.results.length} objects detected`);
            this.updateDetectionStates(data.results);
        });

        this.detectionService.on('webcamDetection', (data) => {
            this.log.debug(`Webcam detection: ${data.results.length} objects detected`);
            this.updateDetectionStates(data.results);
        });

        this.detectionService.on('error', (error) => {
            this.log.error(`Detection service error: ${error}`);
        });

        // File manager events
        this.fileManager.on('fileUploaded', (data) => {
            this.log.info(`File uploaded: ${data.fileInfo.name}`);
        });

        this.fileManager.on('error', (error) => {
            this.log.error(`File manager error: ${error}`);
        });

        // Webcam manager events
        this.webcamManager.on('streamStarted', (data) => {
            this.log.info(`Webcam stream started: ${data.deviceId}`);
        });

        this.webcamManager.on('streamStopped', (data) => {
            this.log.info(`Webcam stream stopped: ${data.deviceId}`);
        });

        this.webcamManager.on('error', (data) => {
            this.log.error(`Webcam manager error for device ${data.deviceId}: ${data.error}`);
        });
    }
    
    

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
    private async onReady(): Promise<void>
    {

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


        this.reolinkApiClient = axios.create({
            baseURL: `https://${this.config.Hostname}`,
            timeout: 4000,
            responseType: "json",
            responseEncoding: "binary",
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });

        await this.setObjectNotExistsAsync('Device', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.Model', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.BuildDay', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.CfgVer', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.Detail', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.DiskNum', {
            type: 'state',
            common: {
                name: '',
                type: 'number',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.FirmVer', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.Name', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.Serial', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Device.Wifi', {
            type: 'state',
            common: {
                name: '',
                type: 'number',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.ActiveLink', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.Connected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.DNS-Auto', {
            type: 'state',
            common: {
                name: '',
                type: 'number',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.DNS-Server01', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.DNS-Server02', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.MAC', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.Gateway', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.IP', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.Mask', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Network.Type', {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'value',
                read: true,
                write: false,
                def: ""
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.MotionDetected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.DogCat', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.DogCat.Detected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.DogCat.Supported', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Face', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Face.Detected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Face.Supported', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.People', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.People.Detected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.People.Supported', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Vehicle', {
            type: 'channel',
            common: {
                name: '',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Vehicle.Detected', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Sensors.Vehicle.Supported', {
            type: 'state',
            common: {
                name: '',
                type: 'boolean',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        // Detection service states
        await this.setObjectNotExistsAsync('Detection', {
            type: 'channel',
            common: {
                name: 'Detection Services',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Detection.ImageDetection', {
            type: 'state',
            common: {
                name: 'Image Detection Enabled',
                type: 'boolean',
                role: 'switch',
                read: true,
                write: true,
                def: true
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Detection.VideoDetection', {
            type: 'state',
            common: {
                name: 'Video Detection Enabled',
                type: 'boolean',
                role: 'switch',
                read: true,
                write: true,
                def: true
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Detection.WebcamDetection', {
            type: 'state',
            common: {
                name: 'Webcam Detection Enabled',
                type: 'boolean',
                role: 'switch',
                read: true,
                write: true,
                def: true
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Detection.LastDetectionTime', {
            type: 'state',
            common: {
                name: 'Last Detection Time',
                type: 'string',
                role: 'value.time',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Detection.DetectionCount', {
            type: 'state',
            common: {
                name: 'Total Detection Count',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                def: 0
            },
            native: {},
        });

        // File upload states
        await this.setObjectNotExistsAsync('FileUpload', {
            type: 'channel',
            common: {
                name: 'File Upload',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('FileUpload.LastUploadedFile', {
            type: 'state',
            common: {
                name: 'Last Uploaded File',
                type: 'string',
                role: 'value',
                read: true,
                write: false
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('FileUpload.UploadCount', {
            type: 'state',
            common: {
                name: 'Upload Count',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                def: 0
            },
            native: {},
        });

        // Webcam states
        await this.setObjectNotExistsAsync('Webcam', {
            type: 'channel',
            common: {
                name: 'Webcam Management',
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Webcam.ActiveStreams', {
            type: 'state',
            common: {
                name: 'Active Streams Count',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                def: 0
            },
            native: {},
        });

        await this.setObjectNotExistsAsync('Webcam.AvailableDevices', {
            type: 'state',
            common: {
                name: 'Available Devices',
                type: 'string',
                role: 'json',
                read: true,
                write: false
            },
            native: {},
        });

        this.announceOffline();

        
	}



    async pollSensors(classInstance:any)
    {
        if (classInstance.config.PollMD)
            classInstance.getMdState();
        if (classInstance.config.PollAI)
            classInstance.getAiState();
    }

    async checkConnection(classInstance:any)
    {
        classInstance.getLocalLink();
    }


    async announceOffline()
    {
        if (this.webcamOnline || this.pollTimer === null)
        {
            this.webcamOnline = false;
            clearInterval(this.pollTimer);
            this.pollTimer = this.setInterval(this.checkConnection, this.config.apiSleepAfterError * 1000, this);
        }
        await this.setStateAsync('info.connection',   {val: false, ack: true});
        await this.setStateAsync("Network.Connected", {val: false, ack: true});
    }

    async announceOnline()
    {
        if (!this.webcamOnline)
        {
            this.webcamOnline = true;
            clearInterval(this.pollTimer);
            this.pollTimer = this.setInterval(this.pollSensors, this.config.apiRefreshInterval, this);
            this.getDevinfo();
            this.getLocalLink();
        }
        await this.setStateAsync('info.connection',   {val: true, ack: true});
        await this.setStateAsync("Network.Connected", {val: true, ack: true});
    }


    async getDevinfo()
    {
        if (this.reolinkApiClient)
        {
            try
            {
                const DevInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetDevInfo&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
                // this.log.debug(`camMdStateInfo ${JSON.stringify(DevInfoValues.status)}: ${JSON.stringify(DevInfoValues.data)}`);

                if(DevInfoValues.status === 200)
                {
                    this.announceOnline();
                    const DevValues = DevInfoValues.data[0];
                    await this.setStateAsync("Device.BuildDay", {val: DevValues.value.DevInfo.buildDay, ack: true});
                    await this.setStateAsync("Device.CfgVer",   {val: DevValues.value.DevInfo.cfgVer,   ack: true});
                    await this.setStateAsync("Device.Detail",   {val: DevValues.value.DevInfo.detail,   ack: true});
                    await this.setStateAsync("Device.DiskNum",  {val: DevValues.value.DevInfo.diskNum,  ack: true});
                    await this.setStateAsync("Device.FirmVer",  {val: DevValues.value.DevInfo.firmVer,  ack: true});
                    await this.setStateAsync("Device.Model",    {val: DevValues.value.DevInfo.model,    ack: true});
                    await this.setStateAsync("Device.Name",     {val: DevValues.value.DevInfo.name,     ack: true});
                    await this.setStateAsync("Device.Serial",   {val: DevValues.value.DevInfo.serial,   ack: true});
                    await this.setStateAsync("Device.Wifi",     {val: DevValues.value.DevInfo.wifi,     ack: true});
                }

            } catch (error:any)
            {
                this.announceOffline();
                this.log.error('Unable to retrieve DeviceInfo from Webcam [' + this.config.Hostname + ']: ' + error);
            }
        }
    }


    async getLocalLink()
    {
        if (this.reolinkApiClient)
        {
            try
            {
                const LinkInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetLocalLink&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
                // this.log.debug(`LinkInfoValues ${JSON.stringify(LinkInfoValues.status)}: ${JSON.stringify(LinkInfoValues.data)}`);

                if(LinkInfoValues.status === 200)
                {
                    this.announceOnline();
                    const LinkValues = LinkInfoValues.data[0];
                    await this.setStateAsync("Network.ActiveLink",   {val: LinkValues.value.LocalLink.activeLink,     ack: true});
                    await this.setStateAsync("Network.DNS-Auto",     {val: LinkValues.value.LocalLink.dns.auto,       ack: true});
                    await this.setStateAsync("Network.DNS-Server01", {val: LinkValues.value.LocalLink.dns.dns1,       ack: true});
                    await this.setStateAsync("Network.DNS-Server02", {val: LinkValues.value.LocalLink.dns.dns2,       ack: true});
                    await this.setStateAsync("Network.MAC",          {val: LinkValues.value.LocalLink.mac,            ack: true});
                    await this.setStateAsync("Network.Gateway",      {val: LinkValues.value.LocalLink.static.gateway, ack: true});
                    await this.setStateAsync("Network.IP",           {val: LinkValues.value.LocalLink.static.ip,      ack: true});
                    await this.setStateAsync("Network.Mask",         {val: LinkValues.value.LocalLink.static.mask,    ack: true});
                    await this.setStateAsync("Network.Type",         {val: LinkValues.value.LocalLink.type,           ack: true});
                }
            } catch (error:any)
            {
                this.announceOffline();
                this.log.error('Unable to retrieve NetworkInfo from from Webcam [' + this.config.Hostname + ']: ' + error);
            }
        }
    }







    async getMdState()
    {
        if (this.reolinkApiClient && this.config.PollMD)
        {
            try
            {
                const MdInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetMdState&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
                // this.log.debug(`camMdStateInfo ${JSON.stringify(MdInfoValues.status)}: ${JSON.stringify(MdInfoValues.data)}`);

                if(MdInfoValues.status === 200)
                {
                    this.announceOnline();
                    const MdValues = MdInfoValues.data[0];
                    await this.setStateAsync("Sensors.MotionDetected", {val: MdValues.value.state === 1, ack: true});
                }
            } catch (error:any)
            {
                this.announceOffline();
                this.log.error('Unable to retrieve State of MotionDetection Sensor from from Webcam [' + this.config.Hostname + ']: ' + error);
            }
        }
    }





    async getAiState()
    {
        if (this.reolinkApiClient && this.config.PollAI)
        {
            try
            {
                const AiInfoValues = await this.reolinkApiClient.get(`/api.cgi?cmd=GetAiState&channel=0&user=${this.config.Username}&password=${this.config.Password}`);
                // this.log.debug(`camAiStateInfo ${JSON.stringify(AiInfoValues.status)}: ${JSON.stringify(AiInfoValues.data)}`);

                if(AiInfoValues.status === 200)
                {
                    this.announceOnline();
                    const AiValues = AiInfoValues.data[0];
                    await this.setStateAsync("Sensors.DogCat.Detected",   {val: AiValues.value.dog_cat.alarm_state === 1, ack: true});
                    await this.setStateAsync("Sensors.DogCat.Supported",  {val: AiValues.value.dog_cat.support     === 1, ack: true});
                    await this.setStateAsync("Sensors.Face.Detected",     {val: AiValues.value.face.alarm_state    === 1, ack: true});
                    await this.setStateAsync("Sensors.Face.Supported",    {val: AiValues.value.face.support        === 1, ack: true});
                    await this.setStateAsync("Sensors.People.Detected",   {val: AiValues.value.people.alarm_state  === 1, ack: true});
                    await this.setStateAsync("Sensors.People.Supported",  {val: AiValues.value.people.support      === 1, ack: true});
                    await this.setStateAsync("Sensors.Vehicle.Detected",  {val: AiValues.value.vehicle.alarm_state === 1, ack: true});
                    await this.setStateAsync("Sensors.Vehicle.Supported", {val: AiValues.value.vehicle.support     === 1, ack: true});
                }
            } catch (error:any)
            {
                this.announceOffline();
                this.log.error('Unable to retrieve State of AI-Detection Sensor from from Webcam [' + this.config.Hostname + ']: ' + error);
            }
        }
    }

    /**
     * Update detection states based on results
     */
    private async updateDetectionStates(results: DetectionResult[]): Promise<void> {
        if (results.length > 0) {
            await this.setStateAsync('Detection.LastDetectionTime', { 
                val: new Date().toISOString(), 
                ack: true 
            });

            // Update detection count
            const currentCount = await this.getStateAsync('Detection.DetectionCount');
            const newCount = (currentCount?.val as number || 0) + results.length;
            await this.setStateAsync('Detection.DetectionCount', { 
                val: newCount, 
                ack: true 
            });

            // Update specific sensor states based on detection results
            for (const result of results) {
                switch (result.type) {
                    case 'motion':
                        await this.setStateAsync('Sensors.MotionDetected', { 
                            val: true, 
                            ack: true 
                        });
                        break;
                    case 'person':
                        await this.setStateAsync('Sensors.People.Detected', { 
                            val: true, 
                            ack: true 
                        });
                        break;
                    case 'vehicle':
                        await this.setStateAsync('Sensors.Vehicle.Detected', { 
                            val: true, 
                            ack: true 
                        });
                        break;
                    case 'face':
                        await this.setStateAsync('Sensors.Face.Detected', { 
                            val: true, 
                            ack: true 
                        });
                        break;
                    case 'dog_cat':
                        await this.setStateAsync('Sensors.DogCat.Detected', { 
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
	private onUnload(callback: () => void): void
    {
		try
        {
            this.announceOffline();
            clearInterval(this.pollTimer);
            
            // Cleanup detection services
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
	private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	private onMessage(obj: ioBroker.Message): void {
		if (typeof obj === 'object' && obj.message) {
			switch (obj.command) {
                case 'uploadFile':
                    this.handleFileUpload(obj);
                    break;
                case 'processImage':
                    this.handleImageProcessing(obj);
                    break;
                case 'processVideo':
                    this.handleVideoProcessing(obj);
                    break;
                case 'startWebcamDetection':
                    this.handleWebcamDetection(obj);
                    break;
                case 'stopWebcamDetection':
                    this.handleStopWebcamDetection(obj);
                    break;
                case 'getWebcamDevices':
                    this.handleGetWebcamDevices(obj);
                    break;
                case 'getUploadedFiles':
                    this.handleGetUploadedFiles(obj);
                    break;
                default:
                    if (obj.command === 'send') {
                        this.log.info('send command');
                        if (obj.callback) {
                            this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                        }
                    }
                    break;
            }
		}
	}

    /**
     * Handle file upload message
     */
    private async handleFileUpload(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.fileManager) {
                throw new Error('File manager not initialized');
            }

            const { fileName, fileData } = obj.message as { fileName: string; fileData: string };
            const fileBuffer = Buffer.from(fileData, 'base64');
            
            const result = await this.fileManager.saveFile(fileName, fileBuffer);
            
            if (result.success && result.fileInfo) {
                await this.setStateAsync('FileUpload.LastUploadedFile', { 
                    val: result.fileInfo.name, 
                    ack: true 
                });
                
                const currentCount = await this.getStateAsync('FileUpload.UploadCount');
                const newCount = (currentCount?.val as number || 0) + 1;
                await this.setStateAsync('FileUpload.UploadCount', { 
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
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle image processing message
     */
    private async handleImageProcessing(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.detectionService) {
                throw new Error('Detection service not initialized');
            }

            const { imagePath } = obj.message as { imagePath: string };
            const results = await this.detectionService.processImage(imagePath);
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true, results }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle video processing message
     */
    private async handleVideoProcessing(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.detectionService) {
                throw new Error('Detection service not initialized');
            }

            const { videoPath } = obj.message as { videoPath: string };
            const results = await this.detectionService.processVideo(videoPath);
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true, results }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle webcam detection start message
     */
    private async handleWebcamDetection(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.detectionService || !this.webcamManager) {
                throw new Error('Detection services not initialized');
            }

            const { deviceId } = obj.message as { deviceId?: string };
            
            // Start webcam stream
            await this.webcamManager.startStream(deviceId || '0');
            
            // Start detection
            await this.detectionService.startWebcamDetection(deviceId);
            
            // Update active streams count
            const activeStreams = this.webcamManager.getActiveStreams();
            await this.setStateAsync('Webcam.ActiveStreams', { 
                val: activeStreams.length, 
                ack: true 
            });
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle webcam detection stop message
     */
    private async handleStopWebcamDetection(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.detectionService || !this.webcamManager) {
                throw new Error('Detection services not initialized');
            }

            const { deviceId } = obj.message as { deviceId?: string };
            
            // Stop detection
            this.detectionService.stopWebcamDetection();
            
            // Stop webcam stream
            if (deviceId) {
                await this.webcamManager.stopStream(deviceId);
            } else {
                await this.webcamManager.stopAllStreams();
            }
            
            // Update active streams count
            const activeStreams = this.webcamManager.getActiveStreams();
            await this.setStateAsync('Webcam.ActiveStreams', { 
                val: activeStreams.length, 
                ack: true 
            });
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle get webcam devices message
     */
    private async handleGetWebcamDevices(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.webcamManager) {
                throw new Error('Webcam manager not initialized');
            }

            const devices = await this.webcamManager.getAvailableDevices();
            
            // Update available devices state
            await this.setStateAsync('Webcam.AvailableDevices', { 
                val: JSON.stringify(devices), 
                ack: true 
            });
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true, devices }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

    /**
     * Handle get uploaded files message
     */
    private async handleGetUploadedFiles(obj: ioBroker.Message): Promise<void> {
        try {
            if (!this.fileManager) {
                throw new Error('File manager not initialized');
            }

            const files = await this.fileManager.getUploadedFiles();
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { success: true, files }, obj.callback);
            }
        } catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, errorResult, obj.callback);
            }
        }
    }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Reolink810a(options);
} else {
	// otherwise start the instance directly
	(() => new Reolink810a())();
}
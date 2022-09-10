/*
 * Created with @iobroker/create-adapter v2.2.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
const axios = require("axios").default;
const https = require("https");

// Load your modules here, e.g.:
// import * as fs from "fs";



class Reolink810a extends utils.Adapter {

    
    private reolinkApiClient : any     = null;
    private pollTimer        : any     = null;
    private webcamOnline     : boolean = false;
    

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
	}
    
    
    

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
    private async onReady(): Promise<void>
    {

        this.announceOffline();

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
                type: 'boolean',
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
                type: 'string',
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




        this.getDevinfo();
        this.getLocalLink();
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
                this.log.error(error);
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
                this.log.error(error);
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
                this.log.error(error);
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
                this.log.error(error);
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
			if (obj.command === 'send') {
				// e.g. send email or pushover or whatever
				this.log.info('send command');

				// Send response in callback if required
				if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
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




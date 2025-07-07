// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			Hostname: string;
			Username: string;
            Password: string;
            PollMD:   boolean;
            PollAI:   boolean;
            apiRefreshInterval: number;
            apiSleepAfterError: number;
            enableImageDetection: boolean;
            enableVideoDetection: boolean;
            enableWebcamDetection: boolean;
            detectionThreshold: number;
            maxFileSize: number;
            cleanupDays: number;
		}
	}

    // declare let reolinkApiClient:any;
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
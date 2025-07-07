import { EventEmitter } from 'events';

export interface WebcamDevice {
    id: string;
    name: string;
    isActive: boolean;
    resolution?: string;
    frameRate?: number;
}

export interface WebcamStream {
    deviceId: string;
    isStreaming: boolean;
    startTime: Date;
    frameCount: number;
    lastFrameTime?: Date;
}

export class WebcamManager extends EventEmitter {
    private activeStreams: Map<string, WebcamStream> = new Map();
    private detectionInterval: NodeJS.Timeout | null = null;
    private streamCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.startStreamMonitoring();
    }

    /**
     * Get available webcam devices
     */
    async getAvailableDevices(): Promise<WebcamDevice[]> {
        // Simulate getting available devices
        // In a real implementation, this would interface with system cameras
        const devices: WebcamDevice[] = [
            {
                id: '0',
                name: 'Default Camera',
                isActive: false,
                resolution: '1920x1080',
                frameRate: 30
            },
            {
                id: '1',
                name: 'USB Camera',
                isActive: false,
                resolution: '1280x720',
                frameRate: 25
            },
            {
                id: 'reolink',
                name: 'Reolink Network Camera',
                isActive: false,
                resolution: '2560x1440',
                frameRate: 30
            }
        ];

        // Mark active devices
        devices.forEach(device => {
            device.isActive = this.activeStreams.has(device.id);
        });

        return devices;
    }

    /**
     * Start webcam stream
     */
    async startStream(deviceId: string): Promise<boolean> {
        try {
            if (this.activeStreams.has(deviceId)) {
                throw new Error(`Stream already active for device ${deviceId}`);
            }

            // Simulate starting webcam stream
            const stream: WebcamStream = {
                deviceId,
                isStreaming: true,
                startTime: new Date(),
                frameCount: 0
            };

            this.activeStreams.set(deviceId, stream);
            
            // Start frame simulation
            this.simulateFrameCapture(deviceId);

            this.emit('streamStarted', { deviceId, stream });
            return true;

        } catch (error) {
            this.emit('error', { deviceId, error });
            return false;
        }
    }

    /**
     * Stop webcam stream
     */
    async stopStream(deviceId: string): Promise<boolean> {
        try {
            const stream = this.activeStreams.get(deviceId);
            if (!stream) {
                return false;
            }

            stream.isStreaming = false;
            this.activeStreams.delete(deviceId);

            this.emit('streamStopped', { deviceId, stream });
            return true;

        } catch (error) {
            this.emit('error', { deviceId, error });
            return false;
        }
    }

    /**
     * Stop all active streams
     */
    async stopAllStreams(): Promise<void> {
        const deviceIds = Array.from(this.activeStreams.keys());
        
        for (const deviceId of deviceIds) {
            await this.stopStream(deviceId);
        }
    }

    /**
     * Get active streams
     */
    getActiveStreams(): WebcamStream[] {
        return Array.from(this.activeStreams.values());
    }

    /**
     * Check if device is streaming
     */
    isStreaming(deviceId: string): boolean {
        const stream = this.activeStreams.get(deviceId);
        return stream ? stream.isStreaming : false;
    }

    /**
     * Get stream statistics
     */
    getStreamStats(deviceId: string): WebcamStream | null {
        return this.activeStreams.get(deviceId) || null;
    }

    /**
     * Capture frame from active stream
     */
    async captureFrame(deviceId: string): Promise<{
        success: boolean;
        frameData?: Buffer;
        timestamp?: Date;
        error?: string;
    }> {
        const stream = this.activeStreams.get(deviceId);
        
        if (!stream || !stream.isStreaming) {
            return {
                success: false,
                error: `No active stream for device ${deviceId}`
            };
        }

        try {
            // Simulate frame capture
            const frameData = Buffer.from('simulated-frame-data');
            const timestamp = new Date();

            // Update stream stats
            stream.frameCount++;
            stream.lastFrameTime = timestamp;

            this.emit('frameCaptured', { deviceId, frameData, timestamp });

            return {
                success: true,
                frameData,
                timestamp
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Set stream resolution
     */
    async setResolution(deviceId: string, width: number, height: number): Promise<boolean> {
        const stream = this.activeStreams.get(deviceId);
        
        if (!stream) {
            return false;
        }

        try {
            // Simulate setting resolution
            this.emit('resolutionChanged', { 
                deviceId, 
                resolution: `${width}x${height}` 
            });
            
            return true;
        } catch (error) {
            this.emit('error', { deviceId, error });
            return false;
        }
    }

    /**
     * Set stream frame rate
     */
    async setFrameRate(deviceId: string, frameRate: number): Promise<boolean> {
        const stream = this.activeStreams.get(deviceId);
        
        if (!stream) {
            return false;
        }

        try {
            // Simulate setting frame rate
            this.emit('frameRateChanged', { deviceId, frameRate });
            return true;
        } catch (error) {
            this.emit('error', { deviceId, error });
            return false;
        }
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
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
    private simulateFrameCapture(deviceId: string): void {
        const interval = setInterval(() => {
            const stream = this.activeStreams.get(deviceId);
            
            if (!stream || !stream.isStreaming) {
                clearInterval(interval);
                return;
            }

            // Simulate frame capture
            this.captureFrame(deviceId);
        }, 1000 / 30); // 30 FPS simulation
    }

    /**
     * Monitor stream health
     */
    private startStreamMonitoring(): void {
        this.streamCheckInterval = setInterval(() => {
            const now = new Date();
            
            for (const [deviceId, stream] of this.activeStreams) {
                if (stream.lastFrameTime) {
                    const timeSinceLastFrame = now.getTime() - stream.lastFrameTime.getTime();
                    
                    // If no frame in last 5 seconds, consider stream unhealthy
                    if (timeSinceLastFrame > 5000) {
                        this.emit('streamUnhealthy', { 
                            deviceId, 
                            timeSinceLastFrame,
                            stream 
                        });
                    }
                }
            }
        }, 10000); // Check every 10 seconds
    }
}
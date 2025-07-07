import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface DetectionResult {
    type: 'motion' | 'person' | 'vehicle' | 'face' | 'dog_cat';
    confidence: number;
    timestamp: Date;
    source: 'image' | 'video' | 'webcam';
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metadata?: any;
}

export interface DetectionConfig {
    enableImageDetection: boolean;
    enableVideoDetection: boolean;
    enableWebcamDetection: boolean;
    detectionThreshold: number;
    supportedFormats: string[];
    maxFileSize: number; // in MB
}

export class DetectionService extends EventEmitter {
    private config: DetectionConfig;
    private isProcessing: boolean = false;
    private supportedImageFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
    private supportedVideoFormats = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

    constructor(config: DetectionConfig) {
        super();
        this.config = config;
    }

    /**
     * Process image file for detection
     */
    async processImage(imagePath: string): Promise<DetectionResult[]> {
        if (!this.config.enableImageDetection) {
            throw new Error('Image detection is disabled');
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
        this.emit('processingStarted', { type: 'image', path: imagePath });

        try {
            // Simulate AI detection processing
            const results = await this.performDetection(imagePath, 'image');
            
            this.emit('detectionComplete', { 
                type: 'image', 
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
    async processVideo(videoPath: string): Promise<DetectionResult[]> {
        if (!this.config.enableVideoDetection) {
            throw new Error('Video detection is disabled');
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
        this.emit('processingStarted', { type: 'video', path: videoPath });

        try {
            // Process video frame by frame
            const results = await this.performVideoDetection(videoPath);
            
            this.emit('detectionComplete', { 
                type: 'video', 
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
    async startWebcamDetection(deviceId?: string): Promise<void> {
        if (!this.config.enableWebcamDetection) {
            throw new Error('Webcam detection is disabled');
        }

        this.isProcessing = true;
        this.emit('webcamDetectionStarted', { deviceId });

        // Simulate continuous webcam detection
        this.performContinuousWebcamDetection(deviceId);
    }

    /**
     * Stop webcam detection
     */
    stopWebcamDetection(): void {
        this.isProcessing = false;
        this.emit('webcamDetectionStopped');
    }

    /**
     * Get available webcam devices
     */
    async getAvailableWebcams(): Promise<Array<{ id: string; name: string }>> {
        // Simulate getting available webcam devices
        return [
            { id: '0', name: 'Default Camera' },
            { id: '1', name: 'USB Camera' },
            { id: 'reolink', name: 'Reolink Camera' }
        ];
    }

    /**
     * Check if detection is currently running
     */
    isDetectionRunning(): boolean {
        return this.isProcessing;
    }

    /**
     * Update detection configuration
     */
    updateConfig(newConfig: Partial<DetectionConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.emit('configUpdated', this.config);
    }

    /**
     * Simulate AI detection on image/video frame
     */
    private async performDetection(filePath: string, source: 'image' | 'video'): Promise<DetectionResult[]> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const results: DetectionResult[] = [];
        const detectionTypes = ['motion', 'person', 'vehicle', 'face', 'dog_cat'] as const;

        // Simulate random detections
        for (const type of detectionTypes) {
            if (Math.random() > 0.7) { // 30% chance of detection
                const confidence = 0.5 + Math.random() * 0.5; // 50-100% confidence
                
                if (confidence >= this.config.detectionThreshold) {
                    results.push({
                        type,
                        confidence,
                        timestamp: new Date(),
                        source,
                        boundingBox: {
                            x: Math.floor(Math.random() * 640),
                            y: Math.floor(Math.random() * 480),
                            width: 50 + Math.floor(Math.random() * 100),
                            height: 50 + Math.floor(Math.random() * 100)
                        },
                        metadata: {
                            filePath,
                            processingTime: 1000 + Math.random() * 2000
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
    private async performVideoDetection(videoPath: string): Promise<DetectionResult[]> {
        const allResults: DetectionResult[] = [];
        const frameCount = 30; // Simulate 30 frames

        for (let frame = 0; frame < frameCount; frame++) {
            this.emit('videoProgress', { 
                frame: frame + 1, 
                total: frameCount, 
                percentage: ((frame + 1) / frameCount) * 100 
            });

            const frameResults = await this.performDetection(videoPath, 'video');
            
            // Add frame information to results
            frameResults.forEach(result => {
                result.metadata = {
                    ...result.metadata,
                    frameNumber: frame + 1,
                    totalFrames: frameCount
                };
            });

            allResults.push(...frameResults);

            // Small delay between frames
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return allResults;
    }

    /**
     * Continuous webcam detection
     */
    private async performContinuousWebcamDetection(deviceId?: string): Promise<void> {
        while (this.isProcessing) {
            try {
                const results = await this.performDetection(`webcam:${deviceId || '0'}`, 'video');
                
                if (results.length > 0) {
                    this.emit('webcamDetection', {
                        deviceId,
                        results,
                        timestamp: new Date()
                    });
                }

                // Wait before next detection cycle
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                this.emit('error', error);
                break;
            }
        }
    }
}
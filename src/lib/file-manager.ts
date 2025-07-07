import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface FileUploadResult {
    success: boolean;
    filePath?: string;
    error?: string;
    fileInfo?: {
        name: string;
        size: number;
        type: string;
        uploadedAt: Date;
    };
}

export class FileManager extends EventEmitter {
    private uploadDir: string;
    private maxFileSize: number; // in bytes
    private allowedExtensions: string[];

    constructor(uploadDir: string = './uploads', maxFileSize: number = 100 * 1024 * 1024) {
        super();
        this.uploadDir = uploadDir;
        this.maxFileSize = maxFileSize;
        this.allowedExtensions = [
            '.jpg', '.jpeg', '.png', '.bmp', '.tiff', // Images
            '.mp4', '.avi', '.mov', '.mkv', '.webm'   // Videos
        ];
        
        this.ensureUploadDirectory();
    }

    /**
     * Save uploaded file
     */
    async saveFile(fileName: string, fileBuffer: Buffer): Promise<FileUploadResult> {
        try {
            const fileExtension = path.extname(fileName).toLowerCase();
            
            // Validate file extension
            if (!this.allowedExtensions.includes(fileExtension)) {
                return {
                    success: false,
                    error: `File type not allowed. Supported formats: ${this.allowedExtensions.join(', ')}`
                };
            }

            // Validate file size
            if (fileBuffer.length > this.maxFileSize) {
                return {
                    success: false,
                    error: `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`
                };
            }

            // Generate unique filename
            const timestamp = Date.now();
            const uniqueFileName = `${timestamp}_${fileName}`;
            const filePath = path.join(this.uploadDir, uniqueFileName);

            // Save file
            await fs.promises.writeFile(filePath, fileBuffer);

            const fileInfo = {
                name: fileName,
                size: fileBuffer.length,
                type: this.getFileType(fileExtension),
                uploadedAt: new Date()
            };

            this.emit('fileUploaded', { filePath, fileInfo });

            return {
                success: true,
                filePath,
                fileInfo
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get list of uploaded files
     */
    async getUploadedFiles(): Promise<Array<{
        name: string;
        path: string;
        size: number;
        type: string;
        uploadedAt: Date;
    }>> {
        try {
            const files = await fs.promises.readdir(this.uploadDir);
            const fileList = [];

            for (const file of files) {
                const filePath = path.join(this.uploadDir, file);
                const stats = await fs.promises.stat(filePath);
                
                if (stats.isFile()) {
                    const fileExtension = path.extname(file).toLowerCase();
                    
                    fileList.push({
                        name: file,
                        path: filePath,
                        size: stats.size,
                        type: this.getFileType(fileExtension),
                        uploadedAt: stats.mtime
                    });
                }
            }

            return fileList.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
        } catch (error) {
            this.emit('error', error);
            return [];
        }
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(fileName: string): Promise<boolean> {
        try {
            const filePath = path.join(this.uploadDir, fileName);
            
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                this.emit('fileDeleted', { fileName, filePath });
                return true;
            }
            
            return false;
        } catch (error) {
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Clean up old files (older than specified days)
     */
    async cleanupOldFiles(daysOld: number = 7): Promise<number> {
        try {
            const files = await fs.promises.readdir(this.uploadDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(this.uploadDir, file);
                const stats = await fs.promises.stat(filePath);
                
                if (stats.isFile() && stats.mtime < cutoffDate) {
                    await fs.promises.unlink(filePath);
                    deletedCount++;
                    this.emit('fileDeleted', { fileName: file, filePath, reason: 'cleanup' });
                }
            }

            this.emit('cleanupComplete', { deletedCount, daysOld });
            return deletedCount;
        } catch (error) {
            this.emit('error', error);
            return 0;
        }
    }

    /**
     * Get file type from extension
     */
    private getFileType(extension: string): string {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

        if (imageExtensions.includes(extension)) {
            return 'image';
        } else if (videoExtensions.includes(extension)) {
            return 'video';
        }
        
        return 'unknown';
    }

    /**
     * Ensure upload directory exists
     */
    private ensureUploadDirectory(): void {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Get upload directory path
     */
    getUploadDirectory(): string {
        return this.uploadDir;
    }

    /**
     * Update configuration
     */
    updateConfig(config: {
        uploadDir?: string;
        maxFileSize?: number;
        allowedExtensions?: string[];
    }): void {
        if (config.uploadDir) {
            this.uploadDir = config.uploadDir;
            this.ensureUploadDirectory();
        }
        
        if (config.maxFileSize) {
            this.maxFileSize = config.maxFileSize;
        }
        
        if (config.allowedExtensions) {
            this.allowedExtensions = config.allowedExtensions;
        }

        this.emit('configUpdated', {
            uploadDir: this.uploadDir,
            maxFileSize: this.maxFileSize,
            allowedExtensions: this.allowedExtensions
        });
    }
}
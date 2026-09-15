import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface StorageResult {
  filename: string;
  storageLocation: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export class StorageService {
  private static uploadBaseDir: string = config.uploadDir;

  /**
   * Ensure directory exists
   */
  public static ensureDirExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get the directory for a specific event's photos
   */
  public static getEventUploadDir(eventId: string): string {
    const eventDir = path.join(this.uploadBaseDir, 'events', eventId);
    this.ensureDirExists(eventDir);
    return eventDir;
  }

  /**
   * Save a buffer or file to the event's storage folder
   */
  public static async saveFile(
    eventId: string,
    filename: string,
    bufferOrPath: Buffer | string,
    mimeType: string
  ): Promise<StorageResult> {
    const eventDir = this.getEventUploadDir(eventId);
    const targetPath = path.join(eventDir, filename);

    if (Buffer.isBuffer(bufferOrPath)) {
      await fs.promises.writeFile(targetPath, bufferOrPath);
    } else {
      await fs.promises.copyFile(bufferOrPath, targetPath);
    }

    const stats = await fs.promises.stat(targetPath);
    const relativeLocation = path.join('events', eventId, filename).replace(/\\/g, '/');

    return {
      filename,
      storageLocation: relativeLocation,
      fileSize: stats.size,
      mimeType,
      url: `/uploads/${relativeLocation}`,
    };
  }

  /**
   * Delete a stored file
   */
  public static async deleteFile(storageLocation: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadBaseDir, storageLocation);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete file at ${storageLocation}:`, error);
      return false;
    }
  }

  /**
   * Get the absolute filesystem path for a stored file
   */
  public static getAbsolutePath(storageLocation: string): string {
    return path.join(this.uploadBaseDir, storageLocation);
  }

  /**
   * Check if file exists
   */
  public static fileExists(storageLocation: string): boolean {
    const fullPath = path.join(this.uploadBaseDir, storageLocation);
    return fs.existsSync(fullPath);
  }
}

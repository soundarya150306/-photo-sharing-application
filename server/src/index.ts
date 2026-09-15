import app from './app';
import { config } from './config';
import { StorageService } from './services/storage.service';

// Ensure base upload directory exists
StorageService.ensureDirExists(config.uploadDir);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` LuminaPhoto Backend API Server`);
  console.log(` Port: ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` API Endpoint: http://0.0.0.0:${config.port}/api`);
  console.log(` Uploads: http://0.0.0.0:${config.port}/uploads`);
  console.log(`=========================================`);
});

export default server;

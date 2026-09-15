import app from './app';
import { config } from './config';
import { StorageService } from './services/storage.service';

// Ensure base upload directory exists
StorageService.ensureDirExists(config.uploadDir);

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(` LuminaPhoto Backend API Server`);
  console.log(` Port: ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` API Endpoint: http://localhost:${config.port}/api`);
  console.log(` Uploads: http://localhost:${config.port}/uploads`);
  console.log(`=========================================`);
});

export default server;

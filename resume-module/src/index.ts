import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
    console.log(`[resume-module] Server running on port ${config.port}`);
    console.log(`[resume-module] Environment: ${config.nodeEnv}`);
});

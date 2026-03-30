/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { logger } from '@/lib/winston';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongoose';

import v1Routes from '@/routes/v1';

import type { CorsOptions } from 'cors';

const app = express();

const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (config.NODE_ENV === 'development' || !origin || config.WHITELIST_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            // Reject request from non-whitelisted origins
            callback(
                new Error(`CORS error: ${origin} is not allowed by CORS`),
                false,
            );
            logger.warning(`CORS error: ${origin} is not allowed by CORS`);
        }
    }
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    compression({
        threshold: 1024, // Only compress responses layer then 1KB
    }),
);
app.use(helmet());
app.use(limiter);

(async () => {
    try {
        await connectToDatabase();
        app.use('/api/v1', v1Routes);

        app.listen(config.PORT, () => {
            logger.info(`Server running: http://localhost:${config.PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start the server', error);

        if(config.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
})();

const handleServershutdown = async () => {
    try {
        await disconnectFromDatabase();
        logger.warn('Server SHUTDOWN');
        process.exit(0);
    } catch (error) {
        logger.error('Error during server shutdown', error);
    }
}

process.on('SIGTERM', handleServershutdown);
process.on('SIGINT', handleServershutdown);
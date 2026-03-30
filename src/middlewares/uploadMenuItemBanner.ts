/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import uploadToCloudinary from "@/lib/cloudinary";

import MenuItem from "@/models/menuItem";

import type { Request, Response, NextFunction } from "express";
import type { UploadApiErrorResponse } from "cloudinary";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const uploadMenuItemBanner = (method: 'post' | 'put') => {
   return async (req: Request, res: Response, next: NextFunction) => {
        if (method === 'put' && !req.file) {
            next();
            return;
        }

        if (!req.file) {
            res.status(400).json({
                code: 'ValidationError',
                message: 'MenuItem banner is required'
            });
            return;
        }

        if (req.file.size > MAX_FILE_SIZE) {
            res.status(413).json({
                code: 'ValidationError',
                message: 'File size must be less then 2MB',
            });
            return;
        }

        try {
            const { menuItemId } = req.params;
            const menuItem = await MenuItem.findById(menuItemId).select('banner.publicId').exec();

            const data = await uploadToCloudinary(
                req.file.buffer,
                menuItem?.banner.publicId.replace('event-api/', ''),
            );

            if (!data) {
                res.status(500).json({
                    code: 'ServerError',
                    message: 'Internal server error',
                });

                logger.error('Error while uploading MenuItem banner to cloudinary', {
                    menuItemId,
                    publicId: menuItem?.banner.publicId
                });
                return;
            }

            const newBanner = {
                publicId: data.public_id,
                url: data.secure_url,
                width: data.width,
                height: data.height,
            };

            logger.info('Event banner uploaded to Cloudinary', {
                menuItemId,
                banner: newBanner,
            });

            req.body.banner = newBanner;

            next();

        } catch (err: unknown) {
            logger.error('Error while uploading Event banner to Cloudinary', err);
            const cloudinaryErr = err as Partial<UploadApiErrorResponse> & { message?: string; name?: string };
            const status = typeof cloudinaryErr.http_code === 'number' ? cloudinaryErr.http_code : 500;
            res.status(status).json({
                code: status < 500 ? 'ValidationError' : 'ServerError',
                message: cloudinaryErr.message ?? 'Internal server error',
            });
         }
   }   
}

export default uploadMenuItemBanner;
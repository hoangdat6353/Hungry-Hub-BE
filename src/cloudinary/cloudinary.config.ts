// cloudinary.config.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
  }
}

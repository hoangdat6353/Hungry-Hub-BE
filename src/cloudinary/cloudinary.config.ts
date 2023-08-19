// cloudinary.config.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;

  constructor() {
    this.cloudName = 'dkg19mmtc';
    this.apiKey = '618151926973987';
    this.apiSecret = 'e795UF33fzX7nowoDdl7eDA9LM8';
  }
}
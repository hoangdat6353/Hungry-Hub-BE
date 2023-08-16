import { Injectable, NestMiddleware } from '@nestjs/common';
import { CorsOptions } from 'src/config/config.model';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export abstract class CorsMiddleware implements NestMiddleware {
  corsConfig: CorsOptions;

  /**
   * Constructor
   */
  constructor() {
    this.corsConfig = ConfigService.cors;
  }

  // https://www.html5rocks.com/en/tutorials/cors/
  use(req: any, res: any, next: () => void) {
    // list of domains
    res.header('Access-Control-Allow-Origin', this.corsConfig.origin);
    // list of headders
    res.header('Access-Control-Allow-Headers', this.corsConfig.headers);
    // list of methods (e.g GET,HEAD,PUT,PATCH,POST,DELETE)
    res.header('Access-Control-Allow-Methods', this.corsConfig.methods);
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
    res.header('Access-Control-Expose-Headers', this.corsConfig.expose);
    // If you want clients to be able to access other headers,
    // you have to use the Access-Control-Expose-Headers header
    // The value of this header is a comma-delimited list of response headers you want to expose to the client.

    next();
  }
}

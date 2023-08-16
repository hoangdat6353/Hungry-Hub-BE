import { DynamicModule } from '@nestjs/common';

import { RequestContext, RequestContextOptions } from './request-context.model';

export class RequestContextModule {
  /**
   * Register
   *
   * @param  {RequestContextOptions} options  The options
   * @return {void}
   */
  static register(options: RequestContextOptions): DynamicModule {
    RequestContext.config(options);

    return {
      module: RequestContextModule,
      exports: [],
      providers: [],
    };
  }
}

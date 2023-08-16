import { ConflictException } from '@nestjs/common';
import { Request, Response } from 'express';
import { getNamespace } from 'node-request-context';

export interface RequestContextOptions {
  namespace?: string;
  keyCurrentUser?: string;
  keyTid?: string;
}

export class RequestContext {
  constructor(request: Request, response: Response) {
    this.id = Math.random();
    this.request = request;
    this.response = response;
  }
  static namespace = 'XXX';
  static keyCurrentUser = 'user';
  static keyCurrentRequestIp = 'clientIp';
  static keyTid = 'tid';
  readonly id: number;

  request: Request;
  response: Response;

  /**
   * Set RequestContext config
   *
   * @param  {string} namespace      The namespace
   * @param  {string} keyCurrentUser The key for current user that will be got from the request. Ex: request['user']
   * @param  {string} keyTid         The tid
   * @return {void}
   */
  static config({
    namespace,
    keyCurrentUser,
    keyTid,
  }: RequestContextOptions): void {
    RequestContext.namespace = namespace;
    RequestContext.keyCurrentUser = keyCurrentUser;
    RequestContext.keyTid = keyTid;
  }

  /**
   * Get current context
   *
   * @return {RequestContext}
   */
  static currentRequestContext(): RequestContext {
    try {
      const namespace = getNamespace(RequestContext.namespace);

      if (!namespace)
        throw new ConflictException(
          'RequestContext has not been registered at AppModule yet',
        );

      const currentContext = namespace.get(RequestContext.keyTid);

      return currentContext;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current request
   *
   * @return {Request}
   */
  static get currentRequest(): Request {
    const requestContext = RequestContext.currentRequestContext();

    return requestContext.request;
  }

  /**
   * Get current user
   *
   * @return {User}
   */
  static get currentUser(): any {
    const requestContext = RequestContext.currentRequestContext();

    return requestContext.request[RequestContext.keyCurrentUser];
  }
}

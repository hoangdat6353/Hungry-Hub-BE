import { getNamespace, createNamespace } from 'node-request-context';
import { RequestContext } from './request-context.model';

/**
 * The request context middleware
 *
 * @param {Request} req - the request
 * @param {Response} res - the response
 * @param {Function} next - the callback
 * @returns {void}
 */
export const RequestContextMiddleware = (req, res, next) => {
  const requestContext = new RequestContext(req, res);
  const namespace =
    getNamespace(RequestContext.namespace) ||
    createNamespace(RequestContext.namespace);

  namespace.run(() => {
    namespace.set(RequestContext.keyTid, requestContext);
    next();
  });
};

export { createClient } from './client';
export { queryString, mutationString, subscriptionString } from './query-builder';
export { selectorBuilder } from './selector';
export { infer, enumOf, schema } from './types';

/**
 * Error thrown when the client receives an error from the server.
 */
export type ClientError = import('graphql-request').ClientError;

export type { Schema } from './types';
export type { Client, ClientOptions, InferClientFromSchema, WSOptions } from './client';

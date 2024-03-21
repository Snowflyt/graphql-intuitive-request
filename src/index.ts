export { createClient } from './client';
export { queryString, mutationString, subscriptionString } from './query-builder';
export { selectorBuilder } from './selector';
export { infer, enumOf, schema } from './types';

/**
 * Error thrown when the client receives an error from the server.
 */
export { ClientError } from 'graphql-request';

export type {
  ValidateDefinition,
  ValidateOperation,
  ValidateOperations,
  ValidateSchema,
} from './types/validator';
export type { Client, ClientOptions, InferClientFromSchema, WSOptions } from './client';

import { Ref } from 'vue-demi';
import { DocumentNode } from 'graphql';
import { CombinedError } from './utils';
import { OperationWithCachePolicy } from './cache';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export interface OperationResult<TData = any> {
  data: TData | null;
  error: CombinedError | null;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first' | 'cache-only';

export type QueryVariables = Record<string, any>;

export interface Operation<TData, TVars> {
  query: string | DocumentNode | TypedDocumentNode<TData, TVars>;
  variables?: TVars;
}

export interface ObserverLike<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface Unsub {
  unsubscribe: () => void;
}

/** An abstract observable interface conforming to: https://github.com/tc39/proposal-observable */
export interface ObservableLike<T> {
  subscribe(observer: ObserverLike<T>): Unsub;
}

export type MaybeReactive<T> = T | Ref<T>;

export interface GraphQLResponse<TData> {
  data: TData;
  errors: any;
}

export type Fetcher = typeof fetch;

export interface FetchOptions extends RequestInit {
  url?: string;
  headers: NonNullable<RequestInit['headers']>;
}

export interface ParsedResponse<TData> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: GraphQLResponse<TData> | null;
}

export type OperationType = 'query' | 'mutation' | 'subscription';

export type AfterQueryCallback = (
  result: OperationResult,
  ctx: { response?: ParsedResponse<unknown> }
) => void | Promise<void>;

export type ClientPluginOperation = OperationWithCachePolicy<unknown, unknown> & { type: OperationType; key: number };

export interface ClientPluginContext {
  useResult: (result: OperationResult<unknown>, terminate?: boolean) => void;
  afterQuery: (cb: AfterQueryCallback) => void;
  operation: ClientPluginOperation;
  opContext: FetchOptions;
  response?: ParsedResponse<unknown>;
}

export type ClientPlugin = ({ useResult, operation }: ClientPluginContext) => void | Promise<void>;

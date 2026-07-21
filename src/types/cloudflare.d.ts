// Minimal Cloudflare Workers binding types (no @cloudflare/workers-types dependency)

interface R2HTTPMetadata {
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
}

interface R2ObjectBody {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: R2HTTPMetadata;
  body: ReadableStream;
  writeHttpMetadata(headers: Headers): void;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
    options?: { httpMetadata?: R2HTTPMetadata; customMetadata?: Record<string, string> },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

// Augment the env returned by getCloudflareContext() (@opennextjs/cloudflare)
declare interface CloudflareEnv {
  R2_BUCKET: R2Bucket;
}

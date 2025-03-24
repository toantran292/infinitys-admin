export interface FileUploadResponse {
  key: string;
  url?: string;
  name: string;
  content_type: string;
  size: number;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export class S3UploadError extends Error {
  code?: string;
  statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = "S3UploadError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  progress: number;
}

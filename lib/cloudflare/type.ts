import { CLOUDFLARE_LANGUAGES } from './languages';

export interface StreamInput {
  height: number;
  width: number;
}

export interface StreamPlayback {
  dash?: string;
  hls?: string;
}

export interface StreamMeta {
  name?: string;
}

export interface StreamStatus {
  errorReasonCode?: string;
  errorReasonText?: string;
  pctComplete?: string | number;
  state?: string; // e.g., 'inprogress', 'ready', 'error'
}

export interface StreamWatermark {
  created: string;
  downloadedFrom?: string;
  height: number;
  name?: string;
  opacity?: number;
  padding?: number;
  position?: string; // e.g., 'center', 'top-left'
  scale?: number;
  size?: number;
  uid: string;
  width: number;
}

export interface StreamVideo {
  allowedOrigins?: string[];
  created: string;
  creator?: string;
  duration: number;
  input?: StreamInput;
  liveInput?: string;
  maxDurationSeconds?: number;
  meta?: StreamMeta;
  modified?: string;
  playback?: StreamPlayback;
  preview?: string;
  readyToStream?: boolean;
  readyToStreamAt?: string;
  requireSignedURLs?: boolean;
  scheduledDeletion?: string;
  size?: number;
  status?: StreamStatus;
  thumbnail?: string;
  thumbnailTimestampPct?: number;
  uid: string;
  uploaded?: string;
  uploadExpiry?: string;
  watermark?: StreamWatermark;
  signedThumbnail?: string; // Pre-fetched signed thumbnail URL
}

export interface StreamResponseInfo {
  code: number;
  message: string;
  documentation_url?: string;
  source?: {
    pointer: string;
  };
}

export interface StreamResponse {
  result: StreamVideo[];
  success: boolean;
  errors: StreamResponseInfo[];
  messages: StreamResponseInfo[];
  range?: number; // The total number of remaining videos based on cursor position
  total?: number; // The total number of videos that match the provided filters
}

export interface StreamDetailResponse<T> {
  result: T;
  success: boolean;
  errors: StreamResponseInfo[];
  messages: StreamResponseInfo[];
}

export interface StreamSearchParams {
  after?: string; // Cursor - Lists videos created after the specified date
  before?: string; // Cursor - Lists videos created before the specified date
  asc?: boolean; // Sort order (default: false for desc)
  creator?: string; // A user-defined identifier for the media creator
  end?: string; // Lists videos created before the specified date (format: date-time)
  // include_counts?: boolean; // Includes total number of videos with the query parameters // ene sda result iig ewdene
  search?: string; // Partial word match of the 'name' key in the 'meta' field
  start?: string; // Lists videos created after the specified date (format: date-time)
  status?:
    | 'pendingupload'
    | 'downloading'
    | 'queued'
    | 'inprogress'
    | 'ready'
    | 'error'
    | 'live-inprogress';
  type?: 'vod' | 'live'; // Filter by video type
  video_name?: string; // Fast
}

export type SupportedCaptionLanguages =
  (typeof CLOUDFLARE_LANGUAGES)[number]['code'];

export interface StreamCaption {
  // Whether the caption was generated via AI.
  generated?: boolean;
  // The language label displayed in the native language to users.
  label?: string;
  // The language tag in BCP 47 format.
  language?: SupportedCaptionLanguages;
  // The status of a generated caption.
  status?: 'ready' | 'inprogress' | 'error';
}

export interface StreamAudio {
  default: boolean;
  label: string;
  status: 'queued' | 'ready' | 'error';
  uid: string;
}

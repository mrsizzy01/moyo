import {
  UserRole,
  ContentStatus,
  VideoQuality,
  MediaType,
  ContentLicense,
  LiveStatus,
  NotificationType,
  ReportReason,
  ReportStatus,
} from './enums';

export interface UserSummaryDto {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
}

export interface CreatorProfileDto {
  id: string;
  userId: string;
  channelName: string;
  slug: string;
  bio?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  subscribersCount: number;
  contentsCount: number;
  createdAt: Date;
}

export interface VideoDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  mediaType: MediaType;
  status: ContentStatus;
  license: ContentLicense;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  creatorId: string;
  creator?: CreatorProfileDto;
  masterPlaylistUrl?: string | null;
  variants?: VideoVariantDto[];
  publishedAt?: Date | null;
  createdAt: Date;
}

export interface VideoVariantDto {
  id: string;
  videoId: string;
  quality: VideoQuality;
  width: number;
  height: number;
  bitrate: number;
  playlistUrl: string;
}

export interface LiveStreamDto {
  id: string;
  creatorId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  status: LiveStatus;
  streamKey?: string; // Only for creator
  hlsPlaybackUrl?: string | null;
  isChatEnabled: boolean;
  isRecordingEnabled: boolean;
  scheduledFor?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  viewersCount: number;
  creator?: CreatorProfileDto;
}

export interface LiveMessageDto {
  id: string;
  liveStreamId: string;
  userId: string;
  username: string;
  userAvatar?: string | null;
  message: string;
  isModerator: boolean;
  createdAt: Date;
}

export interface AudioTrackDto {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string | null;
  albumTitle?: string | null;
  coverUrl?: string | null;
  audioUrl: string;
  durationSeconds: number;
  trackNumber?: number | null;
  genre?: string | null;
  license: ContentLicense;
  playsCount: number;
  likesCount: number;
}

export interface CommentDto {
  id: string;
  contentId: string;
  userId: string;
  username: string;
  userAvatar?: string | null;
  content: string;
  parentId?: string | null;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

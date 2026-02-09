// API Response Types for Persistence Features

export interface PersistOutputRequest {
  outputId: string;
  persistUntil?: string; // ISO datetime string
}

export interface PersistOutputResponse {
  success: boolean;
  output: {
    id: string;
    jobId: string;
    type: 'VIDEO' | 'IMAGE';
    url: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    metadata?: Record<string, unknown>;
    persistUntil?: Date;
    isRemoved: boolean;
    createdAt: Date;
    sceneId?: string;
  };
}

export interface DeleteOutputResponse {
  success: boolean;
  message: string;
}

export interface PersistentOutput {
  id: string;
  type: 'VIDEO' | 'IMAGE';
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  persistUntil?: Date;
  createdAt: Date;
  jobId: string;
  jobMode: 'MODE_A' | 'MODE_B' | 'MODE_C';
  jobTitle?: string;
}

export interface GetPersistentOutputsResponse {
  outputs: PersistentOutput[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SaveAsAvatarResponse {
  success: boolean;
  referenceImage: {
    id: string;
    userId: string;
    outputId: string;
    imageUrl: string;
    isAvatar: boolean;
    createdAt: Date;
  };
}

export interface ReferenceImage {
  id: string;
  imageUrl: string;
  isAvatar: boolean;
  createdAt: Date;
  outputId?: string;
  outputType?: 'VIDEO' | 'IMAGE';
  jobId?: string;
  jobMode?: 'MODE_A' | 'MODE_B' | 'MODE_C';
  jobTitle?: string;
}

export interface GetReferenceImagesResponse {
  images: ReferenceImage[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DeleteReferenceImageResponse {
  success: boolean;
  message: string;
}

export interface DashboardOutput {
  id: string;
  type: 'VIDEO' | 'IMAGE';
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  persistUntil?: Date;
  isRemoved: boolean;
  createdAt: Date;
  jobId: string;
  jobMode: 'MODE_A' | 'MODE_B' | 'MODE_C';
  jobTitle?: string;
  userId: string;
  userEmail: string;
  userName?: string;
}

export interface GetDashboardOutputsResponse {
  outputs: DashboardOutput[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  filters: {
    startDate?: string;
    endDate?: string;
    modelType?: 'MODE_A' | 'MODE_B' | 'MODE_C';
    userEmail?: string;
  };
}

// Error response type
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
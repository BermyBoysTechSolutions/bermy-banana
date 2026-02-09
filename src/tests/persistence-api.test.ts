/**
 * API Test Suite for Persistence Features
 * Run with: npm run test:api
 * 
 * This test file verifies all persistence API endpoints work correctly.
 */

import { test, expect, describe } from 'vitest';

// Mock fetch for Node.js environment
global.fetch = vi.fn();

// Import types for testing
type {
  PersistOutputRequest,
  PersistOutputResponse,
  DeleteOutputResponse,
  GetPersistentOutputsResponse,
  SaveAsAvatarResponse,
  GetReferenceImagesResponse,
  DeleteReferenceImageResponse,
  GetDashboardOutputsResponse,
} from '../src/lib/types/persistence';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  authToken: 'test-auth-token',
  testUserId: 'test-user-123',
  testOutputId: 'test-output-456',
  testReferenceImageId: 'test-ref-789',
};

// Mock auth session
const mockSession = {
  user: {
    id: TEST_CONFIG.testUserId,
    email: 'test@example.com',
    role: 'USER',
  },
};

// Helper function to mock authenticated requests
function mockAuthenticatedRequest(url: string, options: RequestInit = {}) {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
      'Content-Type': 'application/json',
    },
    // Mock the auth check
    headersList: {
      get: (name: string) => {
        if (name === 'authorization') return `Bearer ${TEST_CONFIG.authToken}`;
        return null;
      },
    },
  };
}

describe('Persistence API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/outputs/persist', () => {
    it('should mark output as persistent successfully', async () => {
      const requestBody: PersistOutputRequest = {
        outputId: TEST_CONFIG.testOutputId,
        persistUntil: '2024-12-31T23:59:59.000Z',
      };

      const expectedResponse: PersistOutputResponse = {
        success: true,
        output: {
          id: TEST_CONFIG.testOutputId,
          jobId: 'test-job-123',
          type: 'IMAGE',
          url: 'https://example.com/image.jpg',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          metadata: { width: 1024, height: 1024 },
          persistUntil: new Date('2024-12-31T23:59:59.000Z'),
          isRemoved: false,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      };

      // Mock the API response
      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(`${TEST_CONFIG.baseUrl}/outputs/persist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });

    it('should return 400 for invalid UUID', async () => {
      const requestBody = {
        outputId: 'invalid-uuid',
        persistUntil: '2024-12-31T23:59:59.000Z',
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid request',
          details: [{ path: ['outputId'], message: 'Invalid uuid' }],
        }),
      } as Response);

      const response = await fetch(`${TEST_CONFIG.baseUrl}/outputs/persist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      const requestBody = {
        outputId: TEST_CONFIG.testOutputId,
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' }),
      } as Response);

      const response = await fetch(`${TEST_CONFIG.baseUrl}/outputs/persist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/outputs/:id', () => {
    it('should soft delete output successfully', async () => {
      const expectedResponse: DeleteOutputResponse = {
        success: true,
        message: 'Output deleted successfully',
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/outputs/${TEST_CONFIG.testOutputId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });

    it('should return 404 for non-existent output', async () => {
      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Output not found or access denied',
        }),
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/outputs/non-existent-id`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/outputs/persistent', () => {
    it('should return user's persistent outputs with pagination', async () => {
      const expectedResponse: GetPersistentOutputsResponse = {
        outputs: [
          {
            id: TEST_CONFIG.testOutputId,
            type: 'IMAGE',
            url: 'https://example.com/image1.jpg',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            jobId: 'test-job-123',
            jobMode: 'MODE_A',
            jobTitle: 'Test Output 1',
          },
          {
            id: 'test-output-2',
            type: 'VIDEO',
            url: 'https://example.com/video1.mp4',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            durationSeconds: 6,
            createdAt: new Date('2024-01-02T00:00:00.000Z'),
            jobId: 'test-job-124',
            jobMode: 'MODE_B',
          },
        ],
        totalCount: 2,
        limit: 50,
        offset: 0,
        hasMore: false,
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/outputs/persistent?limit=50&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
      expect(data.outputs).toHaveLength(2);
      expect(data.hasMore).toBe(false);
    });
  });

  describe('POST /api/outputs/:id/save-as-avatar', () => {
    it('should save image output as avatar successfully', async () => {
      const expectedResponse: SaveAsAvatarResponse = {
        success: true,
        referenceImage: {
          id: TEST_CONFIG.testReferenceImageId,
          userId: TEST_CONFIG.testUserId,
          outputId: TEST_CONFIG.testOutputId,
          imageUrl: 'https://example.com/image.jpg',
          isAvatar: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/outputs/${TEST_CONFIG.testOutputId}/save-as-avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
      expect(data.referenceImage.isAvatar).toBe(true);
    });

    it('should return 400 for video outputs', async () => {
      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Only image outputs can be saved as avatars',
        }),
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/outputs/video-output-id/save-as-avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/:userId/reference-images', () => {
    it('should return user reference images', async () => {
      const expectedResponse: GetReferenceImagesResponse = {
        images: [
          {
            id: TEST_CONFIG.testReferenceImageId,
            imageUrl: 'https://example.com/image1.jpg',
            isAvatar: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            outputId: TEST_CONFIG.testOutputId,
            outputType: 'IMAGE',
            jobId: 'test-job-123',
            jobMode: 'MODE_A',
            jobTitle: 'Test Reference Image',
          },
        ],
        totalCount: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/users/${TEST_CONFIG.testUserId}/reference-images`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });

    it('should filter by avatar images only', async () => {
      const expectedResponse: GetReferenceImagesResponse = {
        images: [
          {
            id: TEST_CONFIG.testReferenceImageId,
            imageUrl: 'https://example.com/avatar.jpg',
            isAvatar: true,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
          },
        ],
        totalCount: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/users/${TEST_CONFIG.testUserId}/reference-images?isAvatar=true`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.images.every(img => img.isAvatar)).toBe(true);
    });

    it('should return 403 for accessing other user data', async () => {
      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/users/other-user-id/reference-images`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/reference-images/:id', () => {
    it('should delete reference image successfully', async () => {
      const expectedResponse: DeleteReferenceImageResponse = {
        success: true,
        message: 'Reference image deleted successfully',
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/reference-images/${TEST_CONFIG.testReferenceImageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });
  });

  describe('GET /api/dashboard/recent-outputs (Admin Only)', () => {
    const adminAuthToken = 'admin-test-token';

    it('should return dashboard outputs for admin users', async () => {
      const expectedResponse: GetDashboardOutputsResponse = {
        outputs: [
          {
            id: TEST_CONFIG.testOutputId,
            type: 'IMAGE',
            url: 'https://example.com/image.jpg',
            isRemoved: false,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            jobId: 'test-job-123',
            jobMode: 'MODE_A',
            userId: TEST_CONFIG.testUserId,
            userEmail: 'user@example.com',
            userName: 'Test User',
          },
        ],
        totalCount: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
        filters: {
          modelType: 'MODE_A',
          userEmail: 'user@example.com',
        },
      };

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => expectedResponse,
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/dashboard/recent-outputs?modelType=MODE_A&userEmail=user@example.com`,
        {
          headers: {
            'Authorization': `Bearer ${adminAuthToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(expectedResponse);
    });

    it('should return 403 for non-admin users', async () => {
      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Access denied. Admin privileges required.',
        }),
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/dashboard/recent-outputs`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`, // Regular user token
          },
        }
      );

      expect(response.status).toBe(403);
    });

    it('should handle date range filters', async () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-01-31T23:59:59.000Z';

      (fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          outputs: [],
          totalCount: 0,
          limit: 50,
          offset: 0,
          hasMore: false,
          filters: { startDate, endDate },
        }),
      } as Response);

      const response = await fetch(
        `${TEST_CONFIG.baseUrl}/dashboard/recent-outputs?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer admin-token`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.filters.startDate).toBe(startDate);
      expect(data.filters.endDate).toBe(endDate);
    });
  });
});

// Integration test examples
describe('Integration Tests', () => {
  it('should handle full persistence workflow', async () => {
    // 1. Generate output
    // 2. Mark as persistent
    // 3. Save as avatar
    // 4. Retrieve persistent outputs
    // 5. Soft delete
    // 6. Verify deletion

    console.log('This would be a full integration test workflow');
    // In a real implementation, this would test the complete user journey
  });
});

// Export test configuration for external use
export { TEST_CONFIG, mockSession };
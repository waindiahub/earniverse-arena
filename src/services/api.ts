/**
 * API Service Layer
 * 
 * This is where you'll integrate with your NestJS backend.
 * Replace the mock implementations with actual fetch calls to your API endpoints.
 * 
 * Example:
 * const response = await fetch('http://localhost:3000/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(credentials)
 * });
 */

import {
  ApiResponse,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  Game,
  Tournament,
  LeaderboardEntry,
  LeaderboardQuery,
  Wallet,
  WalletTransaction,
  RewardTokenResponse,
  RewardClaimRequest,
  RewardClaimResponse,
  AdminStats,
  AuditLog,
} from '@/types/api';

// Base API URL - replace with your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
};

// Auth API
export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // return response.json();
    
    // Mock implementation
    return {
      success: true,
      data: {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: '1',
          email: credentials.email,
          role: 'user' as any,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  },

  async signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    // TODO: Replace with actual API call
    // const response = await authFetch('/auth/signup', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
    // return response.json();
    
    return { success: true, data: {} as any };
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    // TODO: Implement token refresh
    return { success: true, data: { accessToken: 'new_token' } };
  },

  async logout(): Promise<void> {
    // TODO: Call backend logout endpoint
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Games API
export const gamesApi = {
  async getGames(): Promise<ApiResponse<Game[]>> {
    // TODO: Replace with actual API call
    // const response = await authFetch('/games');
    // return response.json();
    
    return { success: true, data: [] };
  },

  async getGameById(id: string): Promise<ApiResponse<Game>> {
    // TODO: Replace with actual API call
    return { success: true, data: {} as any };
  },
};

// Tournaments API
export const tournamentsApi = {
  async getTournaments(): Promise<ApiResponse<Tournament[]>> {
    // TODO: Replace with actual API call
    // const response = await authFetch('/tournaments');
    // return response.json();
    
    return { success: true, data: [] };
  },

  async getTournamentById(id: string): Promise<ApiResponse<Tournament>> {
    // TODO: Replace with actual API call
    return { success: true, data: {} as any };
  },

  async registerForTournament(tournamentId: string): Promise<ApiResponse<void>> {
    // TODO: Replace with actual API call
    // const response = await authFetch(`/tournaments/${tournamentId}/register`, {
    //   method: 'POST',
    // });
    // return response.json();
    
    return { success: true };
  },
};

// Leaderboards API
export const leaderboardsApi = {
  async getLeaderboard(query: LeaderboardQuery): Promise<ApiResponse<LeaderboardEntry[]>> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams(query as any);
    // const response = await authFetch(`/leaderboards?${params}`);
    // return response.json();
    
    return { success: true, data: [] };
  },
};

// Wallet API
export const walletApi = {
  async getWallet(): Promise<ApiResponse<Wallet>> {
    // TODO: Replace with actual API call
    // const response = await authFetch('/wallet');
    // return response.json();
    
    return {
      success: true,
      data: {
        id: '1',
        userId: '1',
        balance: 0,
        currency: 'CREDITS',
      },
    };
  },

  async getTransactions(): Promise<ApiResponse<WalletTransaction[]>> {
    // TODO: Replace with actual API call
    return { success: true, data: [] };
  },
};

// Rewards API
export const rewardsApi = {
  async requestToken(): Promise<ApiResponse<RewardTokenResponse>> {
    /**
     * TODO: Replace with actual API call to get server-signed token
     * 
     * This endpoint should:
     * 1. Verify user is authenticated
     * 2. Generate a short-lived JWT token
     * 3. Return token that frontend passes to ad SDK
     * 
     * Example:
     * const response = await authFetch('/rewards/request-token');
     * return response.json();
     */
    
    return {
      success: true,
      data: {
        token: 'mock_reward_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min
      },
    };
  },

  async claimReward(claim: RewardClaimRequest): Promise<ApiResponse<RewardClaimResponse>> {
    /**
     * TODO: Replace with actual API call to verify and credit reward
     * 
     * This endpoint should:
     * 1. Verify the token signature and expiry
     * 2. Verify impressionId hasn't been used before (prevent duplicates)
     * 3. Optionally verify with ad network server-to-server
     * 4. Credit user wallet in a DB transaction
     * 5. Log the reward in rewards_log table
     * 6. Return new balance
     * 
     * Example:
     * const response = await authFetch('/rewards/claim', {
     *   method: 'POST',
     *   body: JSON.stringify(claim),
     * });
     * return response.json();
     */
    
    return {
      success: true,
      data: {
        success: true,
        rewardAmount: 10,
        newBalance: 100,
        message: 'Reward claimed successfully!',
      },
    };
  },
};

// Admin API
export const adminApi = {
  async getStats(): Promise<ApiResponse<AdminStats>> {
    // TODO: Replace with actual API call
    // const response = await authFetch('/admin/stats');
    // return response.json();
    
    return {
      success: true,
      data: {
        totalUsers: 0,
        activeTournaments: 0,
        totalRevenue: 0,
        pendingPayouts: 0,
      },
    };
  },

  async getUsers(): Promise<ApiResponse<User[]>> {
    // TODO: Replace with actual API call
    return { success: true, data: [] };
  },

  async banUser(userId: string, reason: string): Promise<ApiResponse<void>> {
    // TODO: Replace with actual API call
    // const response = await authFetch(`/admin/users/${userId}/ban`, {
    //   method: 'POST',
    //   body: JSON.stringify({ reason }),
    // });
    // return response.json();
    
    return { success: true };
  },

  async getAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    // TODO: Replace with actual API call
    return { success: true, data: [] };
  },
};

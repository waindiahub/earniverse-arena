// Shared TypeScript types for API communication
// These should match your backend DTOs

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  BATTLE_ROYALE = 'battle_royale',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum Platform {
  PC = 'pc',
  PLAYSTATION = 'playstation',
  XBOX = 'xbox',
  MOBILE = 'mobile',
  SWITCH = 'switch',
}

// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  dateOfBirth?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  country?: string;
  bio?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  phone?: string;
  displayName: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Game types
export interface Game {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  publisher?: string;
  platform: Platform[];
  createdAt: string;
}

// Tournament types
export interface Tournament {
  id: string;
  gameId: string;
  game?: Game;
  name: string;
  format: TournamentFormat;
  startAt: string;
  endAt: string;
  entryFee: number;
  prizePool: number;
  status: TournamentStatus;
  maxParticipants?: number;
  currentParticipants?: number;
  rules?: string;
  createdAt: string;
}

export interface TournamentRegistration {
  id: string;
  userId: string;
  tournamentId: string;
  teamId?: string;
  registeredAt: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  gameId: string;
  userId: string;
  user?: User;
  score: number;
  recordedAt: string;
  rank?: number;
}

export interface LeaderboardQuery {
  gameId?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'alltime';
  limit?: number;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  reason: string;
  txRef?: string;
  createdAt: string;
}

// Rewards / Ad types
export interface RewardTokenRequest {
  userId: string;
}

export interface RewardTokenResponse {
  token: string;
  expiresAt: string;
}

export interface RewardClaimRequest {
  adProvider: string;
  impressionId: string;
  token: string;
}

export interface RewardClaimResponse {
  success: boolean;
  rewardAmount: number;
  newBalance: number;
  message?: string;
}

export interface RewardsLog {
  id: string;
  userId: string;
  adProvider: string;
  impressionId: string;
  rewardAmount: number;
  verified: boolean;
  createdAt: string;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  activeTournaments: number;
  totalRevenue: number;
  pendingPayouts: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  details: Record<string, any>;
  ip?: string;
  createdAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

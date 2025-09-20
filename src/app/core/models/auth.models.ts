export interface User {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdDate: Date;
  // Additional frontend-only properties
  firstName?: string;
  lastName?: string;
  roles?: string[];
  permissions?: string[];
  avatar?: string;
  lastLoginAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
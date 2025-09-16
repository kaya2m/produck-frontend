export interface Role {
  id: string;
  name: string;
  normalizedName: string;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  roleIds: string[];
}

export interface UpdateUserRequest {
  isActive?: boolean;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateUserProfileRequest {
  email?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  phoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface CreateUserResponse {
  success: boolean;
  userId?: string;
  message?: string;
  errors?: string[];
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface AssignRolesToUserResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface UserDetailDto {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdDate: Date;
  roles: Role[];
  lastLoginAt?: Date;
}
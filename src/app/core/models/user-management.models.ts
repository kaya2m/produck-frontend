export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface CreateRoleResponse {
  roleId: string;
  success: boolean;
  errors: string[];
}

export interface UpdateRoleResponse {
  success: boolean;
  errors: string[];
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface AssignPermissionsResponse {
  success: boolean;
  assignedPermissions: string[];
  errors: string[];
}

export interface RemovePermissionsRequest {
  permissionIds: string[];
}

export interface RemovePermissionsResponse {
  success: boolean;
  errors: string[];
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  category: string;
}

export interface UpdatePermissionRequest {
  name: string;
  description: string;
  category: string;
}

export interface CreatePermissionResponse {
  permissionId: string;
  success: boolean;
  errors: string[];
}

export interface UpdatePermissionResponse {
  success: boolean;
  errors: string[];
}

export interface InitializeDefaultPermissionsResponse {
  message: string;
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
  username?: string;
  email?: string;
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

export interface UserDto {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface UserDetailDto extends UserDto {
  roles: Role[];
  lastModifiedDate: string;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}
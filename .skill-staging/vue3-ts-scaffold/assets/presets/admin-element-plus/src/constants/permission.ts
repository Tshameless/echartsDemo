export const PERMISSION_KEYS = {
  exampleRead: 'example:read',
  exampleCreate: 'example:create',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export interface LoginForm {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

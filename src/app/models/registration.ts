export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dob: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPair {
  token: string;
  expires: string;
}

export interface AuthTokens {
  access: TokenPair;
  refresh: TokenPair;
}

export interface User {
  name: string;
  email: string;
  role: string;
  id: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

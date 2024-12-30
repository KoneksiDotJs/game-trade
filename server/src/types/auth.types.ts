export interface RegisterDTO {
  email: string;
  password: string;
  username: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: "worker" | "manager" | string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

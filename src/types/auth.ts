export interface LoginPayload {
  Email: string;
  Password: string;
}

export interface SignupPayload {
  Name: string;
  Email: string;
  Password: string;
  Date_of_birth?: string;
}

export interface ForgotPasswordPayload {
  Email: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    UserID: number;
    Name: string;
    Email: string;
  };
}
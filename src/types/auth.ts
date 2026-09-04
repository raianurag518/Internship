export type Role = 'STUDENT' | 'ORGANIZER' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  college: string;
  studentId?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  role: Role;
  verificationStatus: VerificationStatus;
  trustRating: number;
  totalTrades: number;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  college: string;
  studentId?: string;
  phoneNumber?: string;
  department?: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

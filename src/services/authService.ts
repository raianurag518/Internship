import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterDTO, LoginDTO, UserSession } from '@/types/auth';
import { isCollegiateEmail } from '@/lib/crypto';
import { createAuditLog } from './auditService';

export async function registerUser(data: RegisterDTO): Promise<{ user: UserSession }> {
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('An account with this college email already exists.');
  }

  const isVerifiedAcademic = isCollegiateEmail(email);
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name.trim(),
      college: data.college.trim(),
      studentId: data.studentId?.trim() || null,
      phoneNumber: data.phoneNumber?.trim() || null,
      department: data.department?.trim() || null,
      role: data.role || 'STUDENT',
      verificationStatus: isVerifiedAcademic ? 'VERIFIED' : 'PENDING',
      trustRating: 0.0,
      totalTrades: 0,
    },
  });

  createAuditLog(user.id, 'USER_REGISTERED', 'User', user.id, {
    email: user.email,
    college: user.college,
    verified: isVerifiedAcademic,
  });

  const session: UserSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    college: user.college,
    studentId: user.studentId,
    phoneNumber: user.phoneNumber,
    department: user.department,
    role: user.role as any,
    verificationStatus: user.verificationStatus as any,
    trustRating: user.trustRating,
    totalTrades: user.totalTrades,
  };

  return { user: session };
}

export async function loginUser(data: LoginDTO): Promise<UserSession> {
  const email = data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password credentials.');
  }

  if (user.isSuspended) {
    throw new Error('This college account has been suspended by administration.');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password credentials.');
  }

  createAuditLog(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    college: user.college,
    studentId: user.studentId,
    phoneNumber: user.phoneNumber,
    department: user.department,
    role: user.role as any,
    verificationStatus: user.verificationStatus as any,
    trustRating: user.trustRating,
    totalTrades: user.totalTrades,
  };
}

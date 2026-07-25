import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export type Context = {
  userId?: string | null;
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.user.findUnique({ where: { id: context.userId } });
    },
    jobs: async (_: any, __: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.job.findMany({
        where: { userId: context.userId },
        include: { company: true },
        orderBy: { dateApplied: 'desc' },
      });
    },
    companies: async (_: any, __: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.company.findMany({
        where: { userId: context.userId },
      });
    },
    interviews: async (_: any, __: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.interview.findMany({
        where: { job: { userId: context.userId } },
        include: { job: { include: { company: true } } },
        orderBy: { date: 'asc' },
      });
    },
  },

  Mutation: {
    register: async (_: any, args: { name: string; email: string; password: string }) => {
      const { name, email, password } = args;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User with this email already exists');
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
      return { token, user };
    },
    login: async (_: any, args: { email: string; password: string }) => {
      const { email, password } = args;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid email or password');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error('Invalid email or password');
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
      return { token, user };
    },
    createJob: async (_: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.job.create({
        data: { ...args, salary: args.salary ? parseFloat(args.salary) : null, userId: context.userId },
        include: { company: true },
      });
    },
    updateJobStatus: async (_: any, args: { jobId: string; status: string }, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.job.update({
        where: { id: args.jobId },
        data: { status: args.status },
        include: { company: true },
      });
    },
    createCompany: async (_: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.company.create({
        data: { ...args, userId: context.userId },
      });
    },
    createInterview: async (_: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.interview.create({
        data: {
          date: new Date(args.date),
          platform: args.platform,
          notes: args.notes,
          job: { connect: { id: args.jobId } },
        },
        include: { job: { include: { company: true } } },
      });
    },
    updateInterview: async (_: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      const updateData: any = {};
      if (args.date) updateData.date = new Date(args.date);
      if (args.platform !== undefined) updateData.platform = args.platform;
      if (args.notes !== undefined) updateData.notes = args.notes;
      
      return await prisma.interview.update({
        where: { id: args.id },
        data: updateData,
        include: { job: { include: { company: true } } },
      });
    },
    deleteInterview: async (_: any, args: { id: string }, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.interview.delete({
        where: { id: args.id },
        include: { job: { include: { company: true } } },
      });
    },
  },
};

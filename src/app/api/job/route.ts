import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const jobs = await prisma.job.findMany();
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const job = await prisma.job.create({ data });
  return NextResponse.json(job);
}
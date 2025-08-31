import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const data = await req.json();
    const job = await prisma.job.update({ where: { id: params.id }, data });
    return NextResponse.json(job);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await prisma.job.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
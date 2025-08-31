import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const data = await req.json();
    const candidate = await prisma.candidate.update({ where: { id: params.id }, data });
    return NextResponse.json(candidate);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const candidateId = params.id;
    await prisma.cvUpload.deleteMany({ where: { candidate_id: candidateId } });
    await prisma.candidate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
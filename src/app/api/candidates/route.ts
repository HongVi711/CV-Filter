import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
        prisma.candidate.findMany({
        skip,
        take: limit,
        include: {
            cv_uploads: {
            where: { status: 'processed' },
            orderBy: { created_at: 'desc' },
            take: 1,
            },
        },
        }),
        prisma.candidate.count(),
    ]);

    const result = candidates.map((c) => ({
        ...c,
        file_url: c.cv_uploads[0]?.file_url ?? null,
    }));

    return NextResponse.json({ candidates: result, total, page, limit });
}


export async function POST(req: NextRequest) {
    const data = await req.json();
    const candidate = await prisma.candidate.create({ data });
    return NextResponse.json(candidate);
}

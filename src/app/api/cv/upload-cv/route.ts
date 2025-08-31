import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import logger from '@/lib/logger';
import { AppError } from '@/lib/appError';
import {
    uploadFileToOpenAI,
    parseCVFromOpenAI,
    scoreCVFromOpenAI,
    deleteOpenAIFile
} from '@/app/api/cv/lib/openaiClient';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const jobId = formData.get('job_id') as string;
        const files = formData.getAll('files') as File[];

        logger.info('Received upload request', { jobId, file_count: files.length });

        if (!jobId || files.length === 0) {
        throw new AppError('Missing job_id or files', 'UPLOAD_VALIDATION', 400);
        }

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
        throw new AppError(`Job not found: ${jobId}`, 'JOB_NOT_FOUND', 404);
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        const newCvs = [];
        const duplicates = [];
        const errors = [];

        for (const file of files) {
        logger.info(`Processing file: ${file.name}`);

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
        await fs.writeFile(filePath, fileBuffer);

        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        logger.info(`Generated hash: ${hash}`);

        let uploadedFile = null;
        let parsedData = null;
        let scoreData = null;

        try {
            uploadedFile = await uploadFileToOpenAI(filePath);
            parsedData = await parseCVFromOpenAI(uploadedFile.id);
            scoreData = await scoreCVFromOpenAI(uploadedFile.id, job.requirements);
            await deleteOpenAIFile(uploadedFile.id);
        } catch (err: any) {
            logger.error(`Error parsing CV ${file.name}`, err);
            errors.push({ file_name: file.name, message: err.message });
            continue;
        }

        const existingCv = await prisma.cvUpload.findFirst({
            where: {
            OR: [
                { hash },
                {
                candidate: {
                    email: parsedData.email || undefined,
                },
                },
            ],
            },
            include: { candidate: true },
        });

        if (existingCv) {
            const duplicateReason = existingCv.hash === hash ? 'hash' : 'email';

            logger.warn('Duplicate CV detected', {
            file: file.name,
            reason: duplicateReason,
            existing_cv_id: existingCv.id,
            });

            duplicates.push({
            existingCvId: existingCv.id,
            file_name: file.name,
            duplicate_reason: duplicateReason,
            existing: {
                name: existingCv.candidate?.full_name || '',
                email: existingCv.candidate?.email || '',
                old_cv_url: existingCv.file_url,
            },
            newData: {
                full_name: parsedData.full_name || '',
                email: parsedData.email || '',
                birthdate: parsedData.birthdate ? new Date(parsedData.birthdate) : null,
                gender: parsedData.gender,
                experience: parsedData.experience ? parseInt(parsedData.experience.toString()) : null,
                skills: parsedData.skills || [],
                address: parsedData.address,
                fit_score: scoreData.fit_score || 0,
                strengths: scoreData.strengths || [],
                weaknesses: scoreData.weaknesses || [],
            },
            });

            // await fs.unlink(filePath);
            continue;
        }

        try {
            const candidate = await prisma.candidate.create({
            data: {
                full_name: parsedData.full_name || '',
                email: parsedData.email || '',
                birthdate: parsedData.birthdate ? new Date(parsedData.birthdate) : null,
                gender: parsedData.gender,
                experience: parsedData.experience ? parseInt(parsedData.experience.toString()) : null,
                skills: parsedData.skills || [],
                address: parsedData.address,
                fit_score: scoreData.fit_score || 0,
                strengths: scoreData.strengths || [],
                weaknesses: scoreData.weaknesses || [],
            },
            });

            await prisma.cvUpload.create({
            data: {
                candidate_id: candidate.id,
                job_id: jobId,
                file_url: filePath.replace(path.join(process.cwd(), 'public'), ''),
                hash,
                status: 'processed',
            },
            });

            newCvs.push(candidate);
            logger.info(`Candidate saved for file: ${file.name}`, { candidate_id: candidate.id });
        } catch (err: any) {
            logger.error(`Failed to save candidate for ${file.name}`, err);
            errors.push({ file_name: file.name, message: err.message });
        }
        }

        logger.info('Upload completed', {
        new_cvs: newCvs.length,
        duplicates: duplicates.length,
        errors: errors.length,
        });

        return NextResponse.json({ new_cvs: newCvs, duplicates, errors });
    } catch (error: any) {
        if (error instanceof AppError) {
        logger.warn('Handled AppError', { message: error.message, code: error.errorCode });
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        logger.error('Unhandled error during CV upload', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@/generated/prisma/client' 
import { AppError } from "@/lib/appError";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const duplicates: DuplicateProcess[] = body.duplicates;

        if (!duplicates || !Array.isArray(duplicates)) {
        throw new AppError("Missing or invalid duplicates data", "VALIDATION_ERROR", 400);
        }

        const results = [];

        for (const item of duplicates) {
        const { existingCvId, newData, mode } = item;

        const existingCv = await prisma.cvUpload.findUnique({
            where: { id: existingCvId },
            include: { candidate: true },
        });

        if (!existingCv || !existingCv.candidate) {
            results.push({
            existingCvId,
            status: "error",
            message: "Existing CV or candidate not found",
            });
            continue;
        }

        const candidate = existingCv.candidate;

        if (mode === "merge") {
            const updatedData: any = {};
            for (const key in newData) {
            const val = newData[key as keyof typeof newData];
            if (Array.isArray(val)) {
                const oldValue = candidate[key as keyof typeof candidate];
                const oldArr = Array.isArray(oldValue) ? oldValue : [];
                updatedData[key] = Array.from(new Set([...oldArr, ...val]));
                } else {
                updatedData[key] = val;
                }
            }

            await prisma.candidate.update({
            where: { id: candidate.id },
            data: updatedData,
            });

            results.push({ existingCvId, status: "merged" });
        } else if (mode === "replace") {
            await prisma.candidate.update({
            where: { id: candidate.id },
            data: {
                full_name: newData.full_name ?? "",
                email: newData.email ?? "",
                birthdate: newData.birthdate ? new Date(newData.birthdate) : null,
                gender: newData.gender ?? null,
                experience: newData.experience ?? null,
                skills: newData.skills ?? [],
                address: newData.address ?? null,
                fit_score: newData.fit_score ?? 0,
                strengths: newData.strengths ?? [],
                weaknesses: newData.weaknesses ?? [],
            },
            });

            results.push({ existingCvId, status: "replaced" });
        } else if (mode === "create_new") {
            const newCandidate = await prisma.candidate.create({
            data: {
                full_name: newData.full_name ?? "",
                email: newData.email ?? "",
                birthdate: newData.birthdate ? new Date(newData.birthdate) : null,
                gender: newData.gender ?? null,
                experience: newData.experience ?? null,
                skills: newData.skills ?? [],
                address: newData.address ?? null,
                fit_score: newData.fit_score ?? 0,
                strengths: newData.strengths ?? [],
                weaknesses: newData.weaknesses ?? [],
            },
            });

            await prisma.cvUpload.create({
            data: {
                candidate_id: newCandidate.id,
                job_id: existingCv.job_id,
                file_url: existingCv.file_url, 
                hash: "",
                status: "processed",
            },
            });

            results.push({ existingCvId, status: "created_new", newCandidateId: newCandidate.id });
        } else {
            results.push({ existingCvId, status: "error", message: "Invalid mode" });
        }
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

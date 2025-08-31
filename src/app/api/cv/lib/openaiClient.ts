import { createReadStream } from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function uploadFileToOpenAI(filePath: string) {
    const fileStream = createReadStream(filePath);
    const uploadedFile = await openai.files.create({
        file: fileStream,
        purpose: 'user_data',
    });
    return uploadedFile;
}

interface ParsedData {
    full_name?: string;
    email?: string;
    birthdate?: string;
    gender?: string;
    experience?: string | number;
    skills?: string[];
    address?: string;
}

interface ScoreData {
    fit_score?: number;
    strengths?: string[];
    weaknesses?: string[];
}

export async function parseCVFromOpenAI(fileId: string): Promise<ParsedData> {
    const parseResponse = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
        {
            role: 'user',
            content: [
            {
                type: 'input_text',
                text: `Extract the following information from this CV:\n
    - full_name\n- birthdate (YYYY-MM-DD)\n- gender\n- email\n- experience (years)\n- address\n- skills (as array)\n\nReturn JSON only.`,
            },
            {
                type: 'input_file',
                file_id: fileId,
            },
            ],
        },
        ],
    });

    let parsedData: ParsedData = {};
    try {
        const cleanedParseText = parseResponse.output_text?.trim().replace(/```json|```/g, '') || '{}';
        parsedData = JSON.parse(cleanedParseText);
    } catch (e) {
        console.error('Failed to parse parsedData JSON:', e);
        parsedData = {};
    }

    return parsedData;
}

export async function scoreCVFromOpenAI(fileId: string, jobRequirements: string): Promise<ScoreData> {
    const scoreResponse = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
        {
            role: 'user',
            content: [
            {
                type: 'input_text',
                text: `Given the job requirements:\n${jobRequirements}\n\nEvaluate the fit of this CV.\nReturn JSON in format:\n{
    "fit_score": number (0-100),
    "strengths": [string],
    "weaknesses": [string]
    }`,
            },
            {
                type: 'input_file',
                file_id: fileId,
            },
            ],
        },
        ],
    });

    let scoreData: ScoreData = {};
    try {
        const cleanedScoreText = scoreResponse.output_text?.trim().replace(/```json|```/g, '') || '{}';
        scoreData = JSON.parse(cleanedScoreText);
    } catch (e) {
        console.error('Failed to parse scoreData JSON:', e);
        scoreData = {};
    }

    return scoreData;
}

export async function deleteOpenAIFile(fileId: string) {
    await openai.files.delete(fileId);
}

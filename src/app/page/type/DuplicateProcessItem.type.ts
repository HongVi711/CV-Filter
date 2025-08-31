type DuplicateCandidate = {
    existingCvId: string;
    file_name: string;
    existing: {
        name: string;
        email: string;
        old_cv_url: string;
    };
    newData: {
        full_name?: string;
        email?: string;
        birthdate?: string | null;
        gender?: string | null;
        experience?: number | null;
        skills?: string[];
        address?: string | null;
        fit_score?: number | null;
        strengths?: string[];
        weaknesses?: string[];
    };
};

type DuplicateProcess = DuplicateCandidate & { mode: "merge" | "replace" | "create_new" };
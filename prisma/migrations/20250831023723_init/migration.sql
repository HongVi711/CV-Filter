-- CreateTable
CREATE TABLE "cv_schema"."Candidate" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "gender" TEXT,
    "experience" INTEGER,
    "skills" TEXT[],
    "address" TEXT,
    "fit_score" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_schema"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_schema"."CvUpload" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "cv_schema"."Candidate"("email");

-- CreateIndex
CREATE INDEX "CvUpload_candidate_id_idx" ON "cv_schema"."CvUpload"("candidate_id");

-- CreateIndex
CREATE INDEX "CvUpload_job_id_idx" ON "cv_schema"."CvUpload"("job_id");

-- AddForeignKey
ALTER TABLE "cv_schema"."CvUpload" ADD CONSTRAINT "CvUpload_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "cv_schema"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_schema"."CvUpload" ADD CONSTRAINT "CvUpload_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "cv_schema"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

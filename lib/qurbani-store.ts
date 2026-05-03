import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import type {
  QurbaniMeatValue,
  QurbaniPaymentValue,
  QurbaniSubmissionRecord,
} from "@/lib/qurbani";
import { QURBANI_SHARE_COST } from "@/lib/qurbani";

type CreateQurbaniSubmissionInput = Omit<QurbaniSubmissionRecord, "id" | "createdAt">;
type UpdateQurbaniSubmissionInput = Partial<
  Pick<
    QurbaniSubmissionRecord,
    "participantName" | "fatherName" | "niyyahName" | "contactNumber" | "addressLocation" | "paymentStatus" | "meatPreference"
  >
> &
  Pick<QurbaniSubmissionRecord, "id">;
type DeleteQurbaniSubmissionInput = Pick<QurbaniSubmissionRecord, "id">;

const fallbackDir = path.join(process.cwd(), ".data");
const fallbackFile = path.join(fallbackDir, "qurbani-submissions.json");

function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function readFallbackSubmissions() {
  try {
    const content = await readFile(fallbackFile, "utf8");
    const records = JSON.parse(content) as Array<Partial<QurbaniSubmissionRecord>>;
    return records.map((record) =>
      normalizeRecord({
        id: String(record.id ?? randomUUID()),
        participantName: String(record.participantName ?? ""),
        fatherName: String(record.fatherName ?? ""),
        niyyahName: String(record.niyyahName ?? ""),
        contactNumber: String(record.contactNumber ?? ""),
        addressLocation: String(record.addressLocation ?? ""),
        shares: Number(record.shares ?? 0),
        totalAmount: Number(record.totalAmount ?? 0),
        paymentStatus: String(record.paymentStatus ?? "PENDING"),
        meatPreference: String(record.meatPreference ?? "RECEIVE_MEAT"),
        createdAt: record.createdAt ?? new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

async function writeFallbackSubmissions(submissions: QurbaniSubmissionRecord[]) {
  await mkdir(fallbackDir, { recursive: true });
  await writeFile(fallbackFile, JSON.stringify(submissions, null, 2), "utf8");
}

function normalizeRecord(record: {
  id: string;
  participantName: string;
  fatherName: string;
  niyyahName: string;
  contactNumber: string;
  addressLocation: string;
  shares: number;
  totalAmount: number;
  paymentStatus: string;
  meatPreference: string;
  createdAt: Date | string;
}) {
  return {
    ...record,
    paymentStatus: record.paymentStatus as QurbaniPaymentValue,
    meatPreference: record.meatPreference as QurbaniMeatValue,
    createdAt:
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : new Date(record.createdAt).toISOString(),
  } satisfies QurbaniSubmissionRecord;
}

async function createFallbackSubmissions(inputs: CreateQurbaniSubmissionInput[]) {
  const submissions = await readFallbackSubmissions();
  const created = inputs.map((input) =>
    normalizeRecord({
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
    })
  );

  submissions.unshift(...created);
  await writeFallbackSubmissions(submissions);
  return created;
}

async function updateFallbackSubmission(input: UpdateQurbaniSubmissionInput) {
  const submissions = await readFallbackSubmissions();
  const index = submissions.findIndex((submission) => submission.id === input.id);

  if (index === -1) {
    throw new Error("Qurbani submission not found");
  }

  const updated = normalizeRecord({
    ...submissions[index],
    ...input,
  });

  submissions[index] = updated;
  await writeFallbackSubmissions(submissions);
  return updated;
}

async function deleteFallbackSubmission(input: DeleteQurbaniSubmissionInput) {
  const submissions = await readFallbackSubmissions();
  const next = submissions.filter((submission) => submission.id !== input.id);

  if (next.length === submissions.length) {
    throw new Error("Qurbani submission not found");
  }

  await writeFallbackSubmissions(next);
}

async function getFallbackSummaryAndSubmissions() {
  const submissions = await readFallbackSubmissions();
  return buildSummaryAndSubmissions(submissions);
}

function sortSubmissionsByCreatedAt(submissions: QurbaniSubmissionRecord[]) {
  return [...submissions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function buildSummaryAndSubmissions(submissions: QurbaniSubmissionRecord[]) {
  const sortedSubmissions = sortSubmissionsByCreatedAt(submissions);
  const totalParticipants = sortedSubmissions.length;
  const totalShares = sortedSubmissions.reduce((sum, item) => sum + item.shares, 0);
  const totalExpectedAmount = sortedSubmissions.reduce((sum, item) => sum + item.totalAmount, 0);

  return {
    summary: {
      totalParticipants,
      totalShares,
      totalExpectedAmount,
    },
    submissions: sortedSubmissions,
  };
}

function mergeSubmissionSets(
  primarySubmissions: QurbaniSubmissionRecord[],
  secondarySubmissions: QurbaniSubmissionRecord[]
) {
  const merged = new Map<string, QurbaniSubmissionRecord>();

  for (const submission of secondarySubmissions) {
    merged.set(submission.id, submission);
  }

  for (const submission of primarySubmissions) {
    merged.set(submission.id, submission);
  }

  return Array.from(merged.values());
}

export async function createQurbaniSubmissions(input: CreateQurbaniSubmissionInput) {
  const entries = Array.from({ length: input.shares }, () => ({
    ...input,
    shares: 1,
    totalAmount: QURBANI_SHARE_COST,
  }));

  if (!isDbConfigured()) {
    return createFallbackSubmissions(entries);
  }

  try {
    const prisma = getPrisma();
    const created = await prisma.$transaction(
      entries.map((entry) =>
        prisma.qurbaniSubmission.create({
          data: entry,
        })
      )
    );
    return created.map(normalizeRecord);
  } catch (error) {
    console.warn("Qurbani DB write failed, using local fallback store instead.", error);
    return createFallbackSubmissions(entries);
  }
}

export async function updateQurbaniSubmission(input: UpdateQurbaniSubmissionInput) {
  if (!isDbConfigured()) {
    return updateFallbackSubmission(input);
  }

  try {
    const prisma = getPrisma();
    const updated = await prisma.qurbaniSubmission.update({
      where: { id: input.id },
      data: input,
    });
    return normalizeRecord(updated);
  } catch (error) {
    console.warn("Qurbani DB update failed, using local fallback store instead.", error);
    return updateFallbackSubmission(input);
  }
}

export async function deleteQurbaniSubmission(input: DeleteQurbaniSubmissionInput) {
  if (!isDbConfigured()) {
    return deleteFallbackSubmission(input);
  }

  try {
    const prisma = getPrisma();
    await prisma.qurbaniSubmission.delete({
      where: { id: input.id },
    });
  } catch (error) {
    console.warn("Qurbani DB delete failed, using local fallback store instead.", error);
    return deleteFallbackSubmission(input);
  }
}

export async function getQurbaniSummaryAndSubmissions() {
  if (!isDbConfigured()) {
    return getFallbackSummaryAndSubmissions();
  }

  try {
    const prisma = getPrisma();
    const [databaseSubmissions, fallbackSubmissions] = await Promise.all([
      prisma.qurbaniSubmission.findMany({
        orderBy: { createdAt: "desc" },
      }),
      readFallbackSubmissions(),
    ]);

    const mergedSubmissions = mergeSubmissionSets(
      fallbackSubmissions,
      databaseSubmissions.map(normalizeRecord)
    );

    return buildSummaryAndSubmissions(mergedSubmissions);
  } catch (error) {
    console.warn("Qurbani DB read failed, using local fallback store instead.", error);
    return getFallbackSummaryAndSubmissions();
  }
}

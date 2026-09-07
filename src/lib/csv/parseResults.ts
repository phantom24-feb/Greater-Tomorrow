import Papa from "papaparse";

export interface ResultImportRow {
  admission_no: string;
  subject: string;
  score: string;
  grade: string;
  remarks: string;
  term: string;
  session: string;
}

export interface ValidatedResultRow extends ResultImportRow {
  rowNumber: number;
  student_id: string | null;
  errors: string[];
}

const REQUIRED_FIELDS: (keyof ResultImportRow)[] = [
  "admission_no",
  "subject",
  "term",
  "session",
];
const VALID_TERMS = ["First Term", "Second Term", "Third Term"];

export function parseResultsCsv(file: File): Promise<ResultImportRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ResultImportRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

export function validateResultRows(
  rows: ResultImportRow[],
  studentMap: Map<string, string>,
): ValidatedResultRow[] {
  return rows.map((row, index) => {
    const errors: string[] = [];
    const admissionNo = row.admission_no?.trim();

    for (const field of REQUIRED_FIELDS) {
      const value = row[field];
      if (!value || !value.toString().trim()) {
        errors.push(`Missing ${field.replace(/_/g, " ")}`);
      }
    }

    const studentId = admissionNo
      ? (studentMap.get(admissionNo) ?? null)
      : null;
    if (admissionNo && !studentId) {
      errors.push(`No student found with admission number "${admissionNo}"`);
    }

    if (row.term && !VALID_TERMS.includes(row.term.trim())) {
      errors.push(`Term must be one of: ${VALID_TERMS.join(", ")}`);
    }

    if (row.score && isNaN(Number(row.score))) {
      errors.push("Score must be a number");
    }

    return {
      ...row,
      admission_no: admissionNo,
      rowNumber: index + 2,
      student_id: studentId,
      errors,
    };
  });
}

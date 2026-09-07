import Papa from "papaparse";

export interface StudentImportRow {
  first_name: string;
  last_name: string;
  other_name: string;
  date_of_birth: string;
  gender: string;
  class_name: string;
  religion: string;
  address: string;
  previous_school: string;
}

export interface ValidatedRow extends StudentImportRow {
  rowNumber: number;
  class_id: string | null;
  errors: string[];
}

const REQUIRED_FIELDS: (keyof StudentImportRow)[] = [
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "class_name",
];

export function parseStudentCsv(file: File): Promise<StudentImportRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<StudentImportRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

export function validateRows(
  rows: StudentImportRow[],
  classMap: Map<string, string>,
): ValidatedRow[] {
  return rows.map((row, index) => {
    const errors: string[] = [];

    for (const field of REQUIRED_FIELDS) {
      const value = row[field];
      if (!value || !value.toString().trim()) {
        errors.push(`Missing ${field.replace(/_/g, " ")}`);
      }
    }

    const gender = row.gender?.trim().toLowerCase();
    if (row.gender && gender !== "male" && gender !== "female") {
      errors.push('Gender must be "male" or "female"');
    }

    const classId = classMap.get(row.class_name?.trim().toLowerCase()) ?? null;
    if (row.class_name && !classId) {
      errors.push(`Unknown class "${row.class_name}"`);
    }

    return {
      ...row,
      gender,
      rowNumber: index + 2, // +1 for header row, +1 for 1-based counting
      class_id: classId,
      errors,
    };
  });
}

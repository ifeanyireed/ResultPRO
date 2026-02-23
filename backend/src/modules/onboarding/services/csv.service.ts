import { ValidationException } from '@modules/common/exceptions/validation.exception';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';
import { SessionRepository } from '../repositories/session.repository';
import { ClassRepository } from '../repositories/class.repository';
import { SubjectRepository } from '../repositories/subject.repository';

interface StudentRecord {
  studentName: string;
  studentId: string;
  className: string;
  matricNumber?: string;
  [key: string]: any; // Subject scores
}

interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

interface CSVValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: StudentRecord[];
  errors: ValidationError[];
  warnings: string[];
  stats: {
    classesFound: string[];
    subjectsFound: string[];
    studentCount: number;
  };
}

interface CSVImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: ValidationError[];
  summary: {
    totalStudents: number;
    classesUpdated: string[];
    resultsCreated: number;
  };
}

export class CSVService {
  private sessionRepo = new SessionRepository();
  private classRepo = new ClassRepository();
  private subjectRepo = new SubjectRepository();

  /**
   * Validate CSV content
   */
  async validateCSV(
    schoolId: string,
    csvContent: string,
    sessionId: string,
    termId: string
  ): Promise<CSVValidationResult> {
    try {
      const records = this.parseCSV(csvContent);
      const validationResult = await this.performValidation(
        schoolId,
        records,
        sessionId,
        termId
      );
      return validationResult;
    } catch (error: any) {
      return {
        isValid: false,
        totalRows: 0,
        validRows: [],
        errors: [
          {
            row: 0,
            field: 'general',
            value: null,
            error: error.message,
          },
        ],
        warnings: [],
        stats: {
          classesFound: [],
          subjectsFound: [],
          studentCount: 0,
        },
      };
    }
  }

  /**
   * Parse CSV string to records
   */
  private parseCSV(csvContent: string): StudentRecord[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new ValidationException('CSV file must have headers and at least one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const records: StudentRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      const record: StudentRecord = {
        studentName: '',
        studentId: '',
        className: '',
      };

      headers.forEach((header, index) => {
        record[header as keyof StudentRecord] = values[index] || '';
      });

      records.push(record);
    }

    return records;
  }

  /**
   * Parse a single CSV line handling quotes
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Perform validation on parsed CSV data
   */
  private async performValidation(
    schoolId: string,
    records: StudentRecord[],
    sessionId: string,
    termId: string
  ): Promise<CSVValidationResult> {
    const errors: ValidationError[] = [];
    const validRows: StudentRecord[] = [];
    const warnings: string[] = [];
    const classesSet = new Set<string>();
    const subjectsSet = new Set<string>();
    let validCount = 0;

    // Required columns
    const requiredColumns = ['studentName', 'studentId', 'className'];

    if (records.length === 0) {
      throw new ValidationException('CSV file is empty or has no valid records');
    }

    // Check headers
    const firstRecord = records[0];
    if (!firstRecord) {
      throw new ValidationException('CSV file has no data');
    }

    for (const col of requiredColumns) {
      if (!(col in firstRecord)) {
        throw new ValidationException(`Required column missing: ${col}`);
      }
    }

    // Get all classes and subjects for school
    const classes = await this.classRepo.findBySchool(schoolId);
    const classMap = new Map(classes.map((c: any) => [c.classCode.toLowerCase(), c]));
    const classIds = classes.map((c: any) => c.id);

    const subjects = await this.subjectRepo.findBySchool(schoolId);
    const subjectMap = new Map(subjects.map((s: any) => [s.subjectCode.toLowerCase(), s]));

    // Validate each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 1;
      let hasErrors = false;

      // Validate required fields
      const studentName = record.studentName?.trim();
      if (!studentName) {
        errors.push({
          row: rowNumber,
          field: 'studentName',
          value: record.studentName,
          error: 'Student name is required',
        });
        hasErrors = true;
      }

      const studentId = record.studentId?.trim();
      if (!studentId) {
        errors.push({
          row: rowNumber,
          field: 'studentId',
          value: record.studentId,
          error: 'Student ID is required',
        });
        hasErrors = true;
      }

      const className = record.className?.trim()?.toUpperCase();
      if (!className) {
        errors.push({
          row: rowNumber,
          field: 'className',
          value: record.className,
          error: 'Class name is required',
        });
        hasErrors = true;
      } else if (!classMap.has(className.toLowerCase())) {
        errors.push({
          row: rowNumber,
          field: 'className',
          value: record.className,
          error: `Class "${className}" not found. Available classes: ${Array.from(classMap.keys()).join(', ')}`,
        });
        hasErrors = true;
      } else {
        classesSet.add(className);
      }

      // Validate subject scores
      const subjectColumns = Object.keys(record).filter(
        (col) => !requiredColumns.includes(col) && record[col] !== ''
      );

      for (const subjectCol of subjectColumns) {
        const scoreValue = record[subjectCol];

        if (isNaN(parseFloat(scoreValue))) {
          errors.push({
            row: rowNumber,
            field: subjectCol,
            value: scoreValue,
            error: `Invalid score for ${subjectCol}: must be a number`,
          });
          hasErrors = true;
        } else {
          const score = parseFloat(scoreValue);
          if (score < 0 || score > 100) {
            errors.push({
              row: rowNumber,
              field: subjectCol,
              value: scoreValue,
              error: `Score for ${subjectCol} must be between 0 and 100`,
            });
            hasErrors = true;
          }
          subjectsSet.add(subjectCol);
        }
      }

      if (!hasErrors) {
        validRows.push(record);
        validCount++;
      }
    }

    // Check if all subjects in CSV exist in school
    const missingSubjects: string[] = [];
    for (const subject of Array.from(subjectsSet)) {
      if (!subjectMap.has(subject.toLowerCase())) {
        missingSubjects.push(subject);
      }
    }

    if (missingSubjects.length > 0) {
      warnings.push(
        `The following subjects are not configured in the system: ${missingSubjects.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      totalRows: records.length,
      validRows,
      errors,
      warnings,
      stats: {
        classesFound: Array.from(classesSet),
        subjectsFound: Array.from(subjectsSet),
        studentCount: validCount,
      },
    };
  }

  /**
   * Generate CSV template
   */
  generateTemplate(schoolClasses: any[], schoolSubjects: any[]): string {
    const headers = ['studentName', 'studentId', 'className', 'matricNumber'];

    // Add all subjects as columns
    const allSubjects = [...new Set(schoolSubjects.map((s: any) => s.subjectCode))];
    headers.push(...allSubjects);

    // Create header row
    const csvLines: string[] = [headers.map((h) => `"${h}"`).join(',')];

    // Create sample row
    const sampleRow = [
      'John Doe',
      '001',
      schoolClasses[0]?.classCode || 'SS1',
      'SS1/001/2024',
      ...allSubjects.map(() => '75'),
    ];

    csvLines.push(sampleRow.map((v) => `"${v}"`).join(','));

    return csvLines.join('\n');
  }

  /**
   * Get CSV import template for a school
   */
  async getCSVTemplate(schoolId: string): Promise<string> {
    try {
      const classes = await this.classRepo.findBySchool(schoolId);
      const subjects = await this.subjectRepo.findBySchool(schoolId);

      if (classes.length === 0) {
        throw new NotFoundException('No classes found. Please create classes first.');
      }

      if (subjects.length === 0) {
        throw new NotFoundException('No subjects found. Please create subjects first.');
      }

      return this.generateTemplate(classes, subjects);
    } catch (error: any) {
      throw new ValidationException(`Failed to generate template: ${error.message}`);
    }
  }

  /**
   * Parse and extract data from validated CSV
   */
  extractCSVData(csvContent: string): Promise<StudentRecord[]> {
    try {
      const records = this.parseCSV(csvContent);
      return Promise.resolve(records);
    } catch (error: any) {
      return Promise.reject(new ValidationException(`CSV parsing failed: ${error.message}`));
    }
  }
}

export const csvService = new CSVService();

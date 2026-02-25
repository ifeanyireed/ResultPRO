import { prisma } from '@config/database';

interface ParsedStudentRow {
  studentId: string;
  studentName: string;
  attendance: { daysPresent: number; daysSchoolOpen: number };
  sex?: string;
  dob?: string;
  age?: number;
  height?: string;
  weight?: string;
  favouriteColor?: string;
  subjectScores: Record<string, { ca1: number; ca2: number; project: number; exam: number }>;
  affectiveDomain: Record<string, number>;
  psychomotorDomain: Record<string, number>;
  principalComments?: string;
  classTeacherComments?: string;
}

export class CSVProcessorService {
  /**
   * Parse CSV file and extract student results
   */
  async processCSV(
    csvContent: string,
    schoolId: string,
    classId: string,
    sessionId: string,
    termId: string,
    subjects: string[]
  ): Promise<any> {
    try {
      // Parse CSV
      const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 4) {
        throw new Error('CSV must have headers and at least one data row');
      }

      // Skip first 3 rows (main headers, sub-headers, example row)
      const dataRows = lines.slice(3);
      
      // Get column headers from row 2 (sub-headers with format hints)
      const subHeaderLine = lines[1];
      const subHeaders = this.parseCSVLine(subHeaderLine);

      // Parse data rows and get subject names from row 1
      const mainHeaderLine = lines[0];
      const mainHeaders = this.parseCSVLine(mainHeaderLine);

      // Find subject positions in the header
      const subjectPositions = this.mapSubjectPositions(mainHeaders, subjects);
      const affectiveTraitsPositions = this.getTraitPositions(subHeaders, 'Affective Domains');
      const psychomotorPositions = this.getTraitPositions(subHeaders, 'Psychomotor Domains');

      // Parse each data row
      const parsedRows: ParsedStudentRow[] = [];
      for (const row of dataRows) {
        const columns = this.parseCSVLine(row);
        
        // Get student ID and skip if empty
        const studentId = columns[0]?.trim();
        const studentName = columns[1]?.trim();
        
        if (!studentId || studentId === 'EX-001') continue; // Skip example row if it slips through

        try {
          const parsed = this.parseStudentRow(
            columns,
            studentId,
            studentName,
            subjectPositions,
            affectiveTraitsPositions,
            psychomotorPositions,
            subjects
          );
          parsedRows.push(parsed);
        } catch (e) {
          console.error(`Error parsing row for student ${studentId}:`, e);
          // Continue processing other rows
        }
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid student data found in CSV');
      }

      // Get grading system for this school
      const gradingSystem = await prisma.gradingSystem.findFirst({
        where: { schoolId, isDefault: true },
        include: { grades: true },
      });

      // Upsert student results
      const results = [];
      for (const row of parsedRows) {
        const studentResult = await this.upsertStudentResult(
          schoolId,
          classId,
          sessionId,
          termId,
          row,
          gradingSystem
        );
        results.push(studentResult);
      }

      // Calculate positions and class averages
      await this.calculatePositionsAndAverages(schoolId, classId, sessionId, termId);

      return {
        success: true,
        message: `Processed ${results.length} student results`,
        data: results,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to process CSV');
    }
  }

  /**
   * Parse a CSV line respecting quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result.map(v => v.trim());
  }

  /**
   * Map subject names to their column positions
   */
  private mapSubjectPositions(
    headers: string[],
    subjects: string[]
  ): Record<string, number> {
    const positions: Record<string, number> = {};

    for (const subject of subjects) {
      const index = headers.findIndex(h => h === subject);
      if (index >= 0) {
        positions[subject] = index;
      }
    }

    return positions;
  }

  /**
   * Get positions of affective traits or psychomotor skills
   */
  private getTraitPositions(headers: string[], sectionName: string): Record<string, number> {
    const positions: Record<string, number> = {};
    let capturing = false;

    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === sectionName) {
        capturing = true;
        continue;
      }

      if (capturing) {
        // Stop if we hit another section header or end
        if (headers[i] === 'Comments' || headers[i] === 'Psychomotor Domains' || headers[i] === 'Affective Domains') {
          break;
        }

        if (headers[i] && headers[i] !== '') {
          positions[headers[i]] = i;
        }
      }
    }

    return positions;
  }

  /**
   * Parse a single student row
   */
  private parseStudentRow(
    columns: string[],
    studentId: string,
    studentName: string,
    subjectPositions: Record<string, number>,
    affectiveTraitsPositions: Record<string, number>,
    psychomotorPositions: Record<string, number>,
    subjects: string[]
  ): ParsedStudentRow {
    const subjectScores: Record<string, { ca1: number; ca2: number; project: number; exam: number }> = {};

    // Extract subject scores (4 columns per subject: CA1, CA2, Project, Exam)
    for (const subject of subjects) {
      const pos = subjectPositions[subject];
      if (pos !== undefined) {
        subjectScores[subject] = {
          ca1: this.parseNumber(columns[pos] || '0'),
          ca2: this.parseNumber(columns[pos + 1] || '0'),
          project: this.parseNumber(columns[pos + 2] || '0'),
          exam: this.parseNumber(columns[pos + 3] || '0'),
        };
      }
    }

    // Extract affective traits
    const affectiveDomain: Record<string, number> = {};
    for (const trait in affectiveTraitsPositions) {
      const pos = affectiveTraitsPositions[trait];
      affectiveDomain[trait] = this.parseNumber(columns[pos] || '0', 1, 5);
    }

    // Extract psychomotor skills
    const psychomotorDomain: Record<string, number> = {};
    for (const skill in psychomotorPositions) {
      const pos = psychomotorPositions[skill];
      psychomotorDomain[skill] = this.parseNumber(columns[pos] || '0', 1, 5);
    }

    return {
      studentId,
      studentName,
      attendance: {
        daysPresent: this.parseNumber(columns[2] || '0'),
        daysSchoolOpen: this.parseNumber(columns[3] || '0'),
      },
      sex: columns[3]?.trim() || undefined,
      dob: columns[4]?.trim() || undefined,
      age: this.parseNumber(columns[5] || '0'),
      height: columns[6]?.trim() || undefined,
      weight: columns[7]?.trim() || undefined,
      favouriteColor: columns[8]?.trim() || undefined,
      subjectScores,
      affectiveDomain,
      psychomotorDomain,
      principalComments: columns[columns.length - 2]?.trim() || undefined,
      classTeacherComments: columns[columns.length - 1]?.trim() || undefined,
    };
  }

  /**
   * Upsert student result (update if exists, create if new)
   */
  private async upsertStudentResult(
    schoolId: string,
    classId: string,
    sessionId: string,
    termId: string,
    row: ParsedStudentRow,
    gradingSystem: any
  ) {
    // Find student by admission number
    const student = await prisma.student.findFirst({
      where: {
        schoolId,
        classId,
        admissionNumber: row.studentId,
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${row.studentId} not found in this class`);
    }

    // Calculate grades and totals for each subject
    const subjectResults: Record<string, any> = {};
    for (const subject in row.subjectScores) {
      const scores = row.subjectScores[subject];
      const total = scores.ca1 + scores.ca2 + scores.project + scores.exam;

      // Find grade from grading system
      const gradeRecord = gradingSystem?.grades?.find(
        (g: any) => total >= g.minScore && total <= g.maxScore
      );
      const grade = gradeRecord?.gradeName || 'F';

      subjectResults[subject] = {
        ca1: scores.ca1,
        ca2: scores.ca2,
        project: scores.project,
        exam: scores.exam,
        total,
        grade,
        classAverage: 0, // Will be calculated later
        positionInClass: 0, // Will be calculated later
        remark: this.generateRemark(grade),
      };
    }

    // Calculate overall average
    const totalScores = Object.values(subjectResults).reduce((sum: number, s: any) => sum + s.total, 0);
    const overallAverage = Object.keys(subjectResults).length > 0 
      ? totalScores / Object.keys(subjectResults).length 
      : 0;

    // Upsert - serialize JSON fields to strings
    const result = await prisma.studentResult.upsert({
      where: {
        schoolId_classId_sessionId_termId_studentId: {
          schoolId,
          classId,
          sessionId,
          termId,
          studentId: student.id,
        },
      },
      update: {
        studentName: row.studentName,
        subjectResults: JSON.stringify(subjectResults),
        daysPresent: row.attendance.daysPresent,
        daysSchoolOpen: row.attendance.daysSchoolOpen,
        affectiveDomain: JSON.stringify(row.affectiveDomain),
        psychomotorDomain: JSON.stringify(row.psychomotorDomain),
        principalComments: row.principalComments,
        classTeacherComments: row.classTeacherComments,
        overallAverage,
        overallRemark: this.generateOverallRemark(overallAverage),
      },
      create: {
        schoolId,
        classId,
        sessionId,
        termId,
        studentId: student.id,
        studentName: row.studentName,
        subjectResults: JSON.stringify(subjectResults),
        daysPresent: row.attendance.daysPresent,
        daysSchoolOpen: row.attendance.daysSchoolOpen,
        affectiveDomain: JSON.stringify(row.affectiveDomain),
        psychomotorDomain: JSON.stringify(row.psychomotorDomain),
        principalComments: row.principalComments,
        classTeacherComments: row.classTeacherComments,
        overallAverage,
        overallRemark: this.generateOverallRemark(overallAverage),
      },
    });

    return result;
  }

  /**
   * Calculate positions and class averages
   */
  private async calculatePositionsAndAverages(
    schoolId: string,
    classId: string,
    sessionId: string,
    termId: string
  ) {
    // Get all student results for this class/session/term
    const allResults = await prisma.studentResult.findMany({
      where: { schoolId, classId, sessionId, termId },
    });

    // Calculate overall positions (by overall average)
    const sorted = [...allResults].sort((a, b) => (b.overallAverage || 0) - (a.overallAverage || 0));
    
    for (let i = 0; i < sorted.length; i++) {
      await prisma.studentResult.update({
        where: { id: sorted[i].id },
        data: { overallPosition: i + 1 },
      });
    }

    // Calculate subject positions and class averages
    // Parse subjectResults from JSON string
    const firstResult = allResults[0];
    if (!firstResult) return;
    
    const firstSubjectResults = JSON.parse(firstResult.subjectResults) as Record<string, any>;
    const subjects = Object.keys(firstSubjectResults);

    for (const subject of subjects) {
      // Calculate class average for this subject
      let totalSubjectScore = 0;
      const subjectScores = [];

      for (const result of allResults) {
        const parsedResults = JSON.parse(result.subjectResults) as Record<string, any>;
        const subjectResult = parsedResults[subject];
        if (subjectResult) {
          totalSubjectScore += subjectResult.total;
          subjectScores.push({ id: result.id, total: subjectResult.total });
        }
      }

      const classAverage = subjectScores.length > 0 ? totalSubjectScore / subjectScores.length : 0;

      // Sort by subject score and get positions
      const sorted = [...subjectScores].sort((a, b) => b.total - a.total);

      // Update each result with class average and position
      for (let i = 0; i < sorted.length; i++) {
        const result = allResults.find((r: any) => r.id === sorted[i].id);
        if (result) {
          const updatedSubjects = JSON.parse(result.subjectResults) as Record<string, any>;
          updatedSubjects[subject].classAverage = Math.round(classAverage * 100) / 100;
          updatedSubjects[subject].positionInClass = i + 1;

          await prisma.studentResult.update({
            where: { id: result.id },
            data: { subjectResults: JSON.stringify(updatedSubjects) },
          });
        }
      }
    }
  }

  /**
   * Parse number with optional min/max bounds
   */
  private parseNumber(value: string, min?: number, max?: number): number {
    const num = parseInt(value, 10) || 0;
    if (min !== undefined) return Math.max(num, min);
    if (max !== undefined) return Math.min(num, max);
    return num;
  }

  /**
   * Generate remark based on grade
   */
  private generateRemark(grade: string): string {
    const remarks: Record<string, string> = {
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Fair',
      'F': 'Poor',
    };
    return remarks[grade] || 'Good';
  }

  /**
   * Generate overall remark based on average
   */
  private generateOverallRemark(average: number): string {
    if (average >= 80) return 'Excellent Performance';
    if (average >= 70) return 'Very Good Performance';
    if (average >= 60) return 'Good Performance';
    if (average >= 50) return 'Fair Performance';
    return 'Needs Improvement';
  }
}

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

      console.log('\n🚀 CSV PROCESSING START');
      console.log('Total CSV lines:', lines.length);

      // Skip first 3 rows (main headers, sub-headers, example row)
      const dataRows = lines.slice(3);
      
      // Get column headers from row 2 (sub-headers with format hints)
      const subHeaderLine = lines[1];
      const subHeaders = this.parseCSVLine(subHeaderLine);

      // Parse data rows and get subject names from row 1
      const mainHeaderLine = lines[0];
      const mainHeaders = this.parseCSVLine(mainHeaderLine);

      console.log(`\n📋 Row 1 (Main Headers) - ${mainHeaders.length} columns:`);
      console.log(mainHeaders);
      
      console.log(`\n📋 Row 2 (Sub Headers) - ${subHeaders.length} columns:`);
      console.log(subHeaders);

      // Find subject positions
      const subjectPositions = this.mapSubjectPositions(mainHeaders, subjects);

      // Find affective and psychomotor positions by looking in mainHeaders for section start
      const affectiveTraitsPositions = this.getTraitPositions(mainHeaders, subHeaders, 'Affective Domains');
      const psychomotorPositions = this.getTraitPositions(mainHeaders, subHeaders, 'Psychomotor Domains');

      console.log(`\n📨 About to parse ${dataRows.length} data rows`);

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

      console.log('Grading system found:', gradingSystem);
      if (!gradingSystem) {
        console.warn('⚠️ No default grading system found for school:', schoolId);
      }

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

    console.log('🔍 mapSubjectPositions - Subjects to find:', subjects);
    console.log('🔍 mapSubjectPositions - Available headers:', headers);

    for (const subject of subjects) {
      const index = headers.findIndex(h => h === subject);
      if (index >= 0) {
        positions[subject] = index;
        console.log(`✅ Found subject "${subject}" at column ${index}`);
      } else {
        console.warn(`❌ Subject "${subject}" NOT found in headers`);
        // Try to find partial matches
        const partialMatches = headers
          .map((h, i) => h.toLowerCase().includes(subject.toLowerCase()) ? i : -1)
          .filter(i => i >= 0);
        if (partialMatches.length > 0) {
          console.warn(`   Found partial matches at positions:`, partialMatches);
        }
      }
    }

    console.log('📍 Final subject positions:', positions);
    return positions;
  }

  /**
   * Get positions of affective traits or psychomotor skills
   * Look for section header in mainHeaders, then extract trait names from subHeaders
   */
  private getTraitPositions(mainHeaders: string[], subHeaders: string[], sectionName: string): Record<string, number> {
    const positions: Record<string, number> = {};
    
    // Find where this section starts in mainHeaders
    const sectionStartIndex = mainHeaders.findIndex(h => h === sectionName);
    if (sectionStartIndex < 0) {
      console.warn(`Section "${sectionName}" not found in main headers`);
      return positions;
    }

    console.log(`Found "${sectionName}" at position ${sectionStartIndex} in mainHeaders`);

    // Find where next section starts (either "Psychomotor Domains", "Affective Domains", or "Comments")
    const nextSectionKeywords = ['Comments', 'Psychomotor Domains', 'Affective Domains'];
    let sectionEndIndex = mainHeaders.length;
    
    for (let i = sectionStartIndex + 1; i < mainHeaders.length; i++) {
      if (nextSectionKeywords.includes(mainHeaders[i])) {
        sectionEndIndex = i;
        break;
      }
    }

    console.log(`Section "${sectionName}" ends at position ${sectionEndIndex}`);

    // Extract trait/skill names from subHeaders within this range
    for (let i = sectionStartIndex; i < sectionEndIndex; i++) {
      if (subHeaders[i] && subHeaders[i] !== '' && !nextSectionKeywords.includes(subHeaders[i])) {
        positions[subHeaders[i]] = i;
        console.log(`Added ${sectionName}: "${subHeaders[i]}" at position ${i}`);
      }
    }

    console.log(`Final ${sectionName} positions:`, positions);
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

    // Debug log the row columns
    console.log('\n📊 ========== PARSING STUDENT ROW ==========');
    console.log('Student ID:', studentId, 'Name:', studentName);
    console.log('Total columns in row:', columns.length);
    console.log('Column data:', {
      col0_studentId: columns[0],
      col1_name: columns[1],
      col2_attendance: columns[2],
      col3_sex: columns[3],
      col4_dob: columns[4],
      col5_age: columns[5],
      col6_height: columns[6],
      col7_weight: columns[7],
      col8_favColor: columns[8],
    });

    console.log('\n📚 Subject Positions:', subjectPositions);
    console.log('Subjects to extract:', subjects);

    // Extract subject scores (4 columns per subject: CA1, CA2, Project, Exam)
    for (const subject of subjects) {
      const pos = subjectPositions[subject];
      console.log(`\n  Processing subject: "${subject}" (position: ${pos})`);
      
      if (pos !== undefined) {
        const scores = {
          ca1: this.parseNumber(columns[pos] || '0'),
          ca2: this.parseNumber(columns[pos + 1] || '0'),
          project: this.parseNumber(columns[pos + 2] || '0'),
          exam: this.parseNumber(columns[pos + 3] || '0'),
        };
        console.log(`  ✅ Extracted scores:`, scores);
        subjectScores[subject] = scores;
      } else {
        console.warn(`  ⚠️ Position not found for subject "${subject}"`);
      }
    }

    console.log('\n💁 Affective Trait Positions:', affectiveTraitsPositions);
    // Extract affective traits
    const affectiveDomain: Record<string, number> = {};
    for (const trait in affectiveTraitsPositions) {
      const pos = affectiveTraitsPositions[trait];
      affectiveDomain[trait] = this.parseNumber(columns[pos] || '0', 1, 5);
    }
    console.log('Extracted affective domain:', affectiveDomain);

    console.log('🤸 Psychomotor Positions:', psychomotorPositions);
    // Extract psychomotor skills
    const psychomotorDomain: Record<string, number> = {};
    for (const skill in psychomotorPositions) {
      const pos = psychomotorPositions[skill];
      psychomotorDomain[skill] = this.parseNumber(columns[pos] || '0', 1, 5);
    }
    console.log('Extracted psychomotor domain:', psychomotorDomain);
    console.log('========== END PARSING ==========\n');

    return {
      studentId,
      studentName,
      attendance: {
        daysPresent: this.parseNumber(columns[2] || '0'),
        daysSchoolOpen: 70, // Standard school days
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

      console.log(`Subject: ${subject}, Total: ${total}, Grade: ${grade}, GradeRecord:`, gradeRecord);

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
        sex: row.sex,
        dateOfBirth: row.dob,
        age: row.age,
        height: row.height,
        weight: row.weight,
        favouriteColor: row.favouriteColor,
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
        sex: row.sex,
        dateOfBirth: row.dob,
        age: row.age,
        height: row.height,
        weight: row.weight,
        favouriteColor: row.favouriteColor,
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

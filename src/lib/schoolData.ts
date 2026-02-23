export interface School {
  slug: string;
  name: string;
  motto: string;
  logo?: string;
  logoEmoji?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactEmail?: string;
  contactPhone?: string;
  contactEmail2?: string;
  contactPhone2?: string;
  location?: string;
  fullAddress?: string;
}

export interface SchoolResult {
  studentName: string;
  admissionNumber: string;
  term: string;
  resultType: string;
  classLevel: string;
  position: string;
  positionInSchool: number;
  positionInState?: number;
  totalStudents: number;
  sex?: string;
  age?: number;
  height?: string;
  weight?: string;
  dateOfBirth?: string;
  favouriteColor?: string;
  subjects: {
    name: string;
    score: number;
    ca?: number;
    exam?: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    color: 'green' | 'blue' | 'yellow' | 'orange' | 'red';
    remark?: string;
    classAverage?: number;
    positionInClass?: number;
    firstTermTotal?: number;
    secondTermTotal?: number;
  }[];
  // Optional gradebook fields
  gradebookTemplate?: 'standard' | 'comprehensive' | 'minimal';
  attendance?: {
    daysPresent: number;
    daysSchoolOpen: number;
  };
  affectiveDomain?: {
    [trait: string]: number; // 1-5 rating scale
  };
  psychomotorDomain?: {
    [skill: string]: number; // 1-5 rating scale
  };
  teacherComments?: {
    principal?: string;
    classTeacher?: string;
  };
  totalObtainable?: number;
}

export interface GradebookSection {
  key: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface GradebookTemplate {
  name: string;
  slug: string;
  sections: GradebookSection[];
  gradingSystem?: {
    A: { min: number; max: number; remark: string };
    B: { min: number; max: number; remark: string };
    C: { min: number; max: number; remark: string };
    D: { min: number; max: number; remark: string };
    F: { min: number; max: number; remark: string };
  };
}

// School database (can be replaced with API calls)
export const schoolsDatabase: { [key: string]: School } = {
  'excellence-academy': {
    slug: 'excellence-academy',
    name: 'Alexander Obi International College',
    motto: 'Nurturing Excellence, Building Futures',
    logo: '/AOIC.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#FCD34D',
    contactEmail: 'results@excellenceacademy.edu.ng',
    contactPhone: '+234 806 702 8859',
    contactEmail2: 'info@excellenceacademy.edu.ng',
    contactPhone2: '+234 701 234 5678',
    location: 'Lagos, Nigeria',
    fullAddress: 'Plot 45, Victoria Island, Lagos State, Nigeria',
  },
  'bright-stars-college': {
    slug: 'bright-stars-college',
    name: 'Bright Stars College',
    motto: 'Illuminating Minds, Shaping Leaders',
    logoEmoji: '⭐',
    primaryColor: '#8b5cf6',
    secondaryColor: '#6d28d9',
    accentColor: '#fbbf24',
    contactEmail: 'results@brightstars.edu.ng',
    contactPhone: '+234 807 123 4567',
    location: 'Abuja, Nigeria'
  },
  'vision-academy': {
    slug: 'vision-academy',
    name: 'Vision Academy',
    motto: 'Excellence Through Vision',
    logoEmoji: '👁️',
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    accentColor: '#fbbf24',
    contactEmail: 'results@visionacademy.edu.ng',
    contactPhone: '+234 808 999 5555',
    location: 'Port Harcourt, Nigeria'
  }
};

// Mock results - in production these would come from backend
export const mockResults: { [key: string]: SchoolResult } = {
  'excellence-academy': {
    studentName: 'Okoroafor Omoronke',
    admissionNumber: 'EA2024001',
    term: '2nd Term, 2025/2026 Academic Session',
    resultType: 'End of Term Assessment',
    classLevel: 'SS2',
    position: '4th',
    positionInSchool: 9,
    positionInState: 117,
    totalStudents: 45,
    sex: 'Female',
    age: 16,
    height: '165cm',
    weight: '58kg',
    dateOfBirth: '12th January, 2008',
    favouriteColor: 'Blue',
    gradebookTemplate: 'comprehensive',
    attendance: {
      daysPresent: 38,
      daysSchoolOpen: 40
    },
    affectiveDomain: {
      'Attentiveness': 4,
      'Honesty': 5,
      'Neatness': 4,
      'Politeness': 5,
      'Punctuality/Assembly': 4,
      'Self Control/Calmness': 3,
      'Obedience': 4,
      'Reliability': 5,
      'Sense of Responsibility': 4,
      'Relationship with Others': 4
    },
    psychomotorDomain: {
      'Handling of Tools': 4,
      'Drawing/Painting': 3,
      'Handwriting': 5,
      'Public Speaking': 4,
      'Speech Fluency': 4,
      'Sports and Games': 5
    },
    teacherComments: {
      principal: 'Omoronke is a focused student with excellent academic performance. Continue this good work!',
      classTeacher: 'An exceptional student who demonstrates dedication to learning. Shows great promise in STEM subjects.'
    },
    subjects: [
      { name: 'Mathematics', ca: 35, exam: 52, score: 87, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 72, positionInClass: 2, firstTermTotal: 82, secondTermTotal: 85 },
      { name: 'English Language', ca: 38, exam: 54, score: 92, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 75, positionInClass: 1, firstTermTotal: 88, secondTermTotal: 90 },
      { name: 'Physics', ca: 30, exam: 48, score: 78, grade: 'B', color: 'blue', remark: 'Good', classAverage: 68, positionInClass: 4, firstTermTotal: 76, secondTermTotal: 77 },
      { name: 'Chemistry', ca: 34, exam: 51, score: 85, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 70, positionInClass: 3, firstTermTotal: 80, secondTermTotal: 83 },
      { name: 'Biology', ca: 32, exam: 48, score: 80, grade: 'B', color: 'blue', remark: 'Good', classAverage: 69, positionInClass: 5, firstTermTotal: 78, secondTermTotal: 79 },
      { name: 'History', ca: 36, exam: 52, score: 88, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 71, positionInClass: 2, firstTermTotal: 84, secondTermTotal: 86 },
      { name: 'Geography', ca: 28, exam: 47, score: 75, grade: 'B', color: 'blue', remark: 'Good', classAverage: 65, positionInClass: 6, firstTermTotal: 72, secondTermTotal: 74 },
      { name: 'Civic Education', ca: 37, exam: 53, score: 90, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 76, positionInClass: 1, firstTermTotal: 86, secondTermTotal: 88 },
      { name: 'Literature in English', ca: 36, exam: 52, score: 88, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 73, positionInClass: 2, firstTermTotal: 85, secondTermTotal: 87 },
      { name: 'French', ca: 32, exam: 48, score: 80, grade: 'B', color: 'blue', remark: 'Good', classAverage: 68, positionInClass: 4, firstTermTotal: 77, secondTermTotal: 79 },
      { name: 'Government', ca: 35, exam: 50, score: 85, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 70, positionInClass: 3, firstTermTotal: 81, secondTermTotal: 84 },
      { name: 'Economics', ca: 33, exam: 49, score: 82, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 69, positionInClass: 3, firstTermTotal: 79, secondTermTotal: 81 },
      { name: 'Further Mathematics', ca: 37, exam: 54, score: 91, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 74, positionInClass: 1, firstTermTotal: 87, secondTermTotal: 89 },
      { name: 'Agricultural Science', ca: 31, exam: 47, score: 78, grade: 'B', color: 'blue', remark: 'Good', classAverage: 66, positionInClass: 5, firstTermTotal: 75, secondTermTotal: 77 },
      { name: 'Integrated Science', ca: 34, exam: 50, score: 84, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 71, positionInClass: 2, firstTermTotal: 80, secondTermTotal: 82 },
      { name: 'Computer Science', ca: 36, exam: 53, score: 89, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 74, positionInClass: 1, firstTermTotal: 85, secondTermTotal: 87 },
      { name: 'Music', ca: 35, exam: 50, score: 85, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 70, positionInClass: 3, firstTermTotal: 81, secondTermTotal: 83 },
      { name: 'Physical Education', ca: 38, exam: 55, score: 93, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 77, positionInClass: 1, firstTermTotal: 89, secondTermTotal: 91 },
      { name: 'Visual Arts', ca: 34, exam: 51, score: 85, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 71, positionInClass: 2, firstTermTotal: 81, secondTermTotal: 83 },
      { name: 'Religious Studies', ca: 37, exam: 52, score: 89, grade: 'A', color: 'green', remark: 'Outstanding', classAverage: 75, positionInClass: 1, firstTermTotal: 85, secondTermTotal: 87 }
    ]
  },
  'bright-stars-college': {
    studentName: 'Amara Nwankwo',
    admissionNumber: 'BSC2024015',
    term: '2nd Term, 2025/2026 Academic Session',
    resultType: 'End of Term Assessment',
    classLevel: 'SS3',
    position: '2nd',
    positionInSchool: 2,
    positionInState: 1,
    totalStudents: 52,
    subjects: [
      { name: 'Mathematics', score: 94, grade: 'A', color: 'green' },
      { name: 'English Language', score: 89, grade: 'A', color: 'green' },
      { name: 'Physics', score: 91, grade: 'A', color: 'green' },
      { name: 'Chemistry', score: 88, grade: 'A', color: 'green' },
      { name: 'Biology', score: 86, grade: 'A', color: 'green' },
      { name: 'Literature in English', score: 92, grade: 'A', color: 'green' },
      { name: 'Geography', score: 85, grade: 'A', color: 'green' }
    ]
  },
  'vision-academy': {
    studentName: 'Tobi Adeyemi',
    admissionNumber: 'VA2024008',
    term: '2nd Term, 2025/2026 Academic Session',
    resultType: 'End of Term Assessment',
    classLevel: 'SS2',
    position: '5th',
    positionInSchool: 5,
    totalStudents: 38,
    subjects: [
      { name: 'Mathematics', score: 82, grade: 'A', color: 'green' },
      { name: 'English Language', score: 85, grade: 'A', color: 'green' },
      { name: 'Physics', score: 79, grade: 'B', color: 'blue' },
      { name: 'Chemistry', score: 81, grade: 'A', color: 'green' },
      { name: 'Biology', score: 77, grade: 'B', color: 'blue' },
      { name: 'Further Mathematics', score: 88, grade: 'A', color: 'green' },
      { name: 'ICT', score: 90, grade: 'A', color: 'green' },
      { name: 'Government', score: 83, grade: 'A', color: 'green' }
    ]
  }
};

export function getSchool(slug: string | undefined): School | null {
  if (!slug) return null;
  return schoolsDatabase[slug.toLowerCase()] || null;
}

export function getSchoolResults(slug: string | undefined): SchoolResult | null {
  if (!slug) return null;
  return mockResults[slug.toLowerCase()] || null;
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Upload, Download, AlertCircle, Eye, Printer } from 'lucide-react';
import { CompactGradebook } from '@/components/gradebook/CompactGradebook';
import { getTemplate } from '@/lib/gradebookTemplates';
import { School, SchoolResult, GradebookTemplate } from '@/lib/schoolData';

interface ExamComponent {
  name: string;
  score: number;
}

interface Step7Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
  examConfig?: { 
    components?: ExamComponent[];
    examConfigComponents?: string | any;
  };
  affectiveDomainData?: any;
  psychomotorDomainData?: any;
}

interface StudentResult {
  studentName: string;
  admissionNumber: string;
  classLevel: string;
  sex?: string;
  age?: string;
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  favouriteColor?: string;
  [key: string]: any; // Subject scores, affective domain, psychomotor domain
}

export const Step7ResultsCSV = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
  examConfig,
  affectiveDomainData,
  psychomotorDomainData,
}: Step7Props) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [affectiveTraits, setAffectiveTraits] = useState<string[]>([]);
  const [psychomotorSkills, setPsychomotorSkills] = useState<string[]>([]);
  const [examComponents, setExamComponents] = useState<ExamComponent[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showGradebookPreview, setShowGradebookPreview] = useState(false);
  const [selectedStudentResult, setSelectedStudentResult] = useState<any>(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [previewGradebooks, setPreviewGradebooks] = useState<SchoolResult[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [template, setTemplate] = useState<GradebookTemplate | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showInstanceNameDialog, setShowInstanceNameDialog] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [savingInstance, setSavingInstance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load exam components from Step 2 config
  useEffect(() => {
    let componentsToLoad = null;
    
    // Handle both formats: { components: [...] } and { examConfigComponents: "..." }
    if (examConfig?.components && Array.isArray(examConfig.components)) {
      componentsToLoad = examConfig.components;
      console.log('📊 Exam components loaded from Step 2 (components format):', examConfig.components);
    } else if (examConfig?.examConfigComponents) {
      try {
        const parsed = typeof examConfig.examConfigComponents === 'string'
          ? JSON.parse(examConfig.examConfigComponents)
          : examConfig.examConfigComponents;
        componentsToLoad = parsed;
        console.log('📊 Exam components loaded from Step 2 (examConfigComponents format):', parsed);
      } catch (e) {
        console.error('Failed to parse examConfigComponents:', e);
      }
    }
    
    if (componentsToLoad && componentsToLoad.length > 0) {
      setExamComponents(componentsToLoad);
    } else {
      // Fallback to default components if not provided
      setExamComponents([
        { name: 'CA 1', score: 20 },
        { name: 'CA 2', score: 20 },
        { name: 'Project', score: 10 },
        { name: 'Exam', score: 50 },
      ]);
      console.log('📊 Using default exam components (Step 2 config not available or empty)');
    }
  }, [examConfig]);

  // Load classes, students, subjects, affective traits, and psychomotor skills on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

        // Fetch classes
        const classesResponse = await axios.get('http://localhost:5000/api/onboarding/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allClasses = classesResponse.data.data?.classes || [];
        setClasses(allClasses);

        // Fetch all students
        const studentsResponse = await axios.get('http://localhost:5000/api/results-setup/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allStudents = studentsResponse.data.data?.students || [];
        setStudents(allStudents);

        // Fetch session data once if needed (fallback source)
        let sessionData = null;
        if (!affectiveDomainData?.affectiveTraits || !psychomotorDomainData?.psychomotorSkills) {
          try {
            const sessionResponse = await axios.get('http://localhost:5000/api/results-setup/session', {
              headers: { Authorization: `Bearer ${token}` },
            });
            sessionData = sessionResponse.data.data;
            console.log('✓ Session data fetched from API');
          } catch (e) {
            console.warn('Could not fetch session data:', e);
          }
        }

        // Get affective traits - prioritize passed data → sessionTermData → session API
        let affectiveTraitsData = null;
        if (affectiveDomainData?.affectiveTraits) {
          affectiveTraitsData = affectiveDomainData.affectiveTraits;
          console.log('📍 Using affective traits from Step 3 props');
        } else if (sessionTermData?.affectiveTraits) {
          affectiveTraitsData = sessionTermData.affectiveTraits;
          console.log('📍 Using affective traits from sessionTermData');
        } else if (sessionData?.affectiveTraits) {
          affectiveTraitsData = sessionData.affectiveTraits;
          console.log('📍 Using affective traits from session API');
        }

        if (affectiveTraitsData) {
          try {
            const traits = typeof affectiveTraitsData === 'string' 
              ? JSON.parse(affectiveTraitsData)
              : affectiveTraitsData;
            const traitsArray = Array.isArray(traits) ? traits : [];
            setAffectiveTraits(traitsArray);
            console.log('✓ Affective traits loaded:', traitsArray);
          } catch (e) {
            console.error('Failed to parse affective traits:', e);
          }
        }

        // Get psychomotor skills - prioritize passed data → sessionTermData → session API
        let psychomotorSkillsData = null;
        if (psychomotorDomainData?.psychomotorSkills) {
          psychomotorSkillsData = psychomotorDomainData.psychomotorSkills;
          console.log('📍 Using psychomotor skills from Step 4 props');
        } else if (sessionTermData?.psychomotorSkills) {
          psychomotorSkillsData = sessionTermData.psychomotorSkills;
          console.log('📍 Using psychomotor skills from sessionTermData');
        } else if (sessionData?.psychomotorSkills) {
          psychomotorSkillsData = sessionData.psychomotorSkills;
          console.log('📍 Using psychomotor skills from session API');
        }

        if (psychomotorSkillsData) {
          try {
            const skills = typeof psychomotorSkillsData === 'string'
              ? JSON.parse(psychomotorSkillsData)
              : psychomotorSkillsData;
            const skillsArray = Array.isArray(skills) ? skills : [];
            setPsychomotorSkills(skillsArray);
            console.log('✓ Psychomotor skills loaded:', skillsArray);
          } catch (e) {
            console.error('Failed to parse psychomotor skills:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student and curriculum data',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, [sessionTermData, affectiveDomainData, psychomotorDomainData, toast]);

  // Load subjects when class is selected
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }

      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://localhost:5000/api/results-setup/class-subjects?classId=${selectedClass}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const subjectList = response.data.data?.subjects || [];
        const subjectNames = subjectList.map((s: any) => s.name);
        setSubjects(subjectNames);
        console.log('Subjects loaded for class:', subjectNames);
      } catch (error) {
        console.error('Failed to load subjects for class:', error);
        setSubjects([]);
        toast({
          title: 'Error',
          description: 'Failed to load subjects for selected class',
          variant: 'destructive',
        });
      }
    };

    loadSubjects();
  }, [selectedClass, toast]);

  // Generate CSV template with example row and filtered students
  const generateCsvTemplate = () => {
    // Filter students by selected class
    const filteredStudents = selectedClass
      ? students.filter(student => student.classId === selectedClass)
      : [];

    // Affective traits with defaults
    const affectiveTraitsArray = affectiveTraits.length > 0 
      ? affectiveTraits 
      : ['Attentiveness', 'Honesty', 'Neatness', 'Politeness', 'Punctuality/Assembly', 'Self Control/Calmness', 'Obedience', 'Reliability'];

    // Psychomotor skills with defaults
    const psychomotorSkillsArray = psychomotorSkills.length > 0 
      ? psychomotorSkills 
      : ['Handling of Tools', 'Drawing/Painting', 'Handwriting', 'Public Speaking', 'Speech Fluency'];

    // Create main headers (row 1) - subject names span multiple columns
    const mainHeaders = [
      'Student ID',
      'Name',
      'Attendance',
      'Sex',
      'DOB',
      'Age',
      'Height',
      'Weight',
      'Favourite Color',
      ...subjects.flatMap(s => [s, ...Array(examComponents.length - 1).fill('')]), // Subject name spans N columns (one for each exam component)
      'Affective Domains',
      ...Array(Math.max(0, affectiveTraitsArray.length - 1)).fill(''), // Span remaining affective columns
      'Psychomotor Domains',
      ...Array(Math.max(0, psychomotorSkillsArray.length - 1)).fill(''), // Span remaining psychomotor columns
      'Comments',
      '',
    ];

    // Create sub-headers (row 2) with component names and score ranges
    const subHeaders = [
      '', // Student ID
      '', // Name
      '(days / 70 available)', // Attendance format
      '(M/F)', // Sex format
      '(YYYY-MM-DD)', // DOB format
      '(years)', // Age format
      '', // Height
      '', // Weight
      '', // Favourite Color
      ...subjects.flatMap(() => 
        examComponents.map(comp => `${comp.name} (${comp.score})`)
      ),
      ...affectiveTraitsArray, // Affective traits as sub-headers
      ...psychomotorSkillsArray, // Psychomotor skills as sub-headers
      'Principal Comments', // Comments sub-header 1
      'Form Tutor Comments', // Comments sub-header 2
    ];

    // Create example row with sample data for teacher guidance
    const exampleRow = [
      'EX-001',
      'Example Student',
      '67',
      'M',
      '2008-01-15',
      '16',
      '165cm',
      '58kg',
      'Blue',
      ...subjects.flatMap(() => 
        examComponents.map(comp => {
          // Linear scoring: give lower components lower values, higher components higher values
          const ratio = comp.score / 100;
          return Math.round(comp.score * 0.7 * ratio).toString(); // 70% of component max as example
        })
      ),
      ...affectiveTraitsArray.map(() => '4'), // Sample affective score (1-5)
      ...psychomotorSkillsArray.map(() => '4'), // Sample psychomotor score (1-5)
      'Excellent performance',
      'Very good progress',
    ];

    // Create data rows for all students
    const rows = filteredStudents.map((student, index) => {
      const admissionForId = student.admissionNumber || `STU-${String(index + 1).padStart(4, '0')}`;
      const row: any[] = [
        admissionForId, // Student ID
        student.name,
        '', // Attendance (days)
        '', // Sex
        '', // DOB
        '', // Age
        '', // Height
        '', // Weight
        '', // Favourite Color
        ...subjects.flatMap(() => 
          examComponents.map(() => '') // One empty cell per exam component
        ),
        ...affectiveTraitsArray.map(() => ''), // Empty affective cells
        ...psychomotorSkillsArray.map(() => ''), // Empty psychomotor cells
        '', // Principal Comments
        '', // Form Tutor Comments
      ];
      return row;
    });

    // Convert to CSV format with 2 header rows, example row, then data rows
    const csvContent = [
      mainHeaders.map(h => `"${h}"`).join(','),
      subHeaders.map(h => `"${h}"`).join(','),
      exampleRow.map(cell => `"${cell}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  };

  const downloadTemplate = () => {
    try {
      if (!selectedClass) {
        toast({
          title: 'Error',
          description: 'Please select a class before downloading the template',
          variant: 'destructive',
        });
        return;
      }

      const filteredStudents = students.filter(student => student.classId === selectedClass);
      if (filteredStudents.length === 0) {
        toast({
          title: 'Error',
          description: 'No students in the selected class. Please add students in Step 6.',
          variant: 'destructive',
        });
        return;
      }

      const csvContent = generateCsvTemplate();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'results-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'CSV template downloaded successfully',
      });
    } catch (error) {
      console.error('Failed to download template:', error);
      toast({
        title: 'Error',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  // Parse CSV into structured data
  const parseCSVComplete = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      if (lines.length < 4) {
        throw new Error('CSV must have headers and at least one data row');
      }

      // Parse header rows (lines 0-1) and include all data rows (including example row at line 2)
      const mainHeaders = lines[0]
        .split(',')
        .map(h => h.replace(/"/g, '').trim());
      
      const subHeaders = lines[1]
        .split(',')
        .map(h => h.replace(/"/g, '').trim());

      // Extract data rows (skip header and sub-header, but include example row and all student rows)
      const dataRows = lines.slice(2).map(line =>
        line.split(',').map(cell => cell.replace(/"/g, '').trim())
      );

      console.log('📊 CSV Parsed:');
      console.log('  Main Headers:', mainHeaders);
      console.log('  Sub Headers:', subHeaders);
      console.log('  Data rows:', dataRows.length);
      console.log('  Exam components:', examComponents);

      // Map subject positions - each subject takes N columns (one per exam component)
      const subjectStartCol = 9;
      const componentsPerSubject = examComponents.length;
      const subjectEndCol = subjectStartCol + (subjects.length * componentsPerSubject);
      
      const subjectMap: Record<string, number> = {};
      for (let i = 0; i < subjects.length; i++) {
        subjectMap[subjects[i]] = subjectStartCol + (i * componentsPerSubject);
      }

      console.log('📚 Subject map (components per subject: ' + componentsPerSubject + '):', subjectMap);

      // Find affective traits start position
      const affectiveStartIdx = mainHeaders.findIndex(h => h === 'Affective Domains');
      const psychomotorStartIdx = mainHeaders.findIndex(h => h === 'Psychomotor Domains');
      const commentsStartIdx = mainHeaders.findIndex(h => h === 'Comments');

      console.log('📍 Section positions:', {
        affective: affectiveStartIdx,
        psychomotor: psychomotorStartIdx,
        comments: commentsStartIdx,
      });

      // Extract affective traits from sub-headers between Affective and Psychomotor
      const affectiveDomainTraits: Record<string, number> = {};
      if (affectiveStartIdx >= 0 && psychomotorStartIdx > affectiveStartIdx) {
        for (let col = affectiveStartIdx; col < psychomotorStartIdx; col++) {
          const trait = subHeaders[col];
          if (trait && trait !== '' && trait !== 'Psychomotor Domains') {
            affectiveDomainTraits[trait] = col;
          }
        }
      }

      // Extract psychomotor skills from sub-headers between Psychomotor and Comments
      const psychomotorDomainSkills: Record<string, number> = {};
      if (psychomotorStartIdx >= 0 && commentsStartIdx > psychomotorStartIdx) {
        for (let col = psychomotorStartIdx; col < commentsStartIdx; col++) {
          const skill = subHeaders[col];
          if (skill && skill !== '' && skill !== 'Comments' && skill !== 'Principal Comments' && skill !== 'Form Tutor Comments') {
            psychomotorDomainSkills[skill] = col;
          }
        }
      }

      console.log('💁 Affective Traits:', affectiveDomainTraits);
      console.log('🤸 Psychomotor Skills:', psychomotorDomainSkills);

      return {
        mainHeaders,
        subHeaders,
        dataRows,
        subjectMap,
        affectiveDomainTraits,
        psychomotorDomainSkills,
        componentsPerSubject,
      };
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setCsvFile(file);

      // Parse CSV for preview
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      const rows = lines.slice(1, 6).map(line => 
        line.split(',').map(cell => cell.replace(/"/g, ''))
      );

      setPreview({
        headers,
        rows: rows.filter(r => r.some(cell => cell.trim())),
      });

      setSubmitError(null);
    } catch (error) {
      console.error('Failed to read file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      if (!csvFile) {
        setSubmitError('Please select a CSV file');
        return;
      }

      if (!selectedClass) {
        setSubmitError('Please select a class before uploading');
        return;
      }

      setUploading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      // Parse CSV on frontend with full data extraction
      const parsed = await parseCSVComplete(csvFile);
      const { mainHeaders, subHeaders, dataRows, subjectMap, affectiveDomainTraits, psychomotorDomainSkills } = parsed;

      // Fetch school data for gradebook
      const schoolId = localStorage.getItem('schoolId');
      const schoolRes = await axios.get(
        `http://localhost:5000/api/onboarding/school/${schoolId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const schoolData = schoolRes.data.data;

      // Fetch results setup session to get principal and teacher details with signatures
      let staffInfo: any = {
        principalName: schoolData?.contactPersonName || 'Principal',
        classTeacherName: 'Class Teacher',
      };
      
      try {
        const sessionRes = await axios.get(
          `http://localhost:5000/api/results-setup/session`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionData = sessionRes.data.data;
        
        if (sessionData) {
          // Get principal info from session
          if (sessionData.principalName) {
            staffInfo.principalName = sessionData.principalName;
          }
          if (sessionData.principalSignatureUrl) {
            staffInfo.principalSignature = sessionData.principalSignatureUrl;
          }
          
          // Get class teacher info from session staff data
          if (sessionData.staffData) {
            try {
              const staffDataArray = typeof sessionData.staffData === 'string' 
                ? JSON.parse(sessionData.staffData)
                : sessionData.staffData;
              
              if (Array.isArray(staffDataArray) && staffDataArray.length > 0) {
                const firstTeacher = staffDataArray[0];
                if (firstTeacher.teacherName) {
                  staffInfo.classTeacherName = firstTeacher.teacherName;
                }
                if (firstTeacher.teacherSignatureUrl) {
                  staffInfo.classTeacherSignature = firstTeacher.teacherSignatureUrl;
                }
              }
            } catch (parseErr) {
              console.warn('Could not parse staff data:', parseErr);
            }
          }
        }
      } catch (sessionErr) {
        console.warn('Could not fetch results setup session:', sessionErr);
      }

      // Fetch fresh logo URL
      let freshLogoUrl = schoolData?.logoUrl || schoolData?.logo;
      try {
        const logoRes = await axios.get(
          'http://localhost:5000/api/results-setup/fresh-logo',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        freshLogoUrl = logoRes.data.data?.logoUrl || freshLogoUrl;
      } catch (logoErr) {
        console.warn('Could not fetch fresh logo URL');
      }

      // Map to School format
      const schoolFormatted: School = {
        slug: schoolData.slug || 'school',
        name: schoolData.name,
        motto: schoolData.motto || '',
        logo: freshLogoUrl || undefined,
        logoEmoji: schoolData.logoEmoji,
        primaryColor: schoolData.primaryColor || '#1e40af',
        secondaryColor: schoolData.secondaryColor || '#475569',
        accentColor: schoolData.accentColor || '#3b82f6',
        contactEmail: schoolData.contactEmail,
        contactPhone: schoolData.contactPhone,
        contactEmail2: schoolData.altContactEmail,
        contactPhone2: schoolData.altContactPhone,
        fullAddress: schoolData.fullAddress,
      };
      
      setSchool(schoolFormatted);

      // Get template
      const defaultTemplate = getTemplate('standard');
      setTemplate(defaultTemplate);

      // Get session data
      const sessionId = sessionTermData?.sessionId || localStorage.getItem('sessionId');
      const termId = sessionTermData?.termId || localStorage.getItem('termId');
      
      if (!sessionId || !termId) {
        throw new Error('Session or Term data missing. Please complete Step 1 first.');
      }

      const selectedClassObj = classes.find(c => c.id === selectedClass);
      const sessionData = sessionTermData ? {
        sessionName: sessionTermData.sessionName || 'Session',
        termName: sessionTermData.termName || 'Term 1',
      } : { sessionName: 'Session', termName: 'Term 1' };

      // Parse CSV data rows into gradebook format
      console.log('🎓 Building gradebooks from parsed CSV...');
      const gradebookPreviews: SchoolResult[] = [];

      for (const row of dataRows) {
        // Skip empty rows
        if (!row[0] || !row[0].trim()) continue;

        const admissionNumber = row[0].trim();
        const studentName = row[1]?.trim() || 'N/A';
        const daysPresent = parseInt(row[2] || '0') || 0;
        const sex = row[3]?.trim() || 'M';
        const dateOfBirth = row[4]?.trim() || '-';
        const age = parseInt(row[5] || '0') || 16;
        const height = row[6]?.trim() || '-';
        const weight = row[7]?.trim() || '-';
        const favouriteColor = row[8]?.trim() || '-';

        console.log(`\n📌 Processing student: ${studentName} (${admissionNumber})`);

        // Extract subject scores using dynamic component count
        const subjectResults: any[] = [];
        for (const subject of subjects) {
          const colPos = subjectMap[subject];
          if (colPos !== undefined) {
            // Extract scores for each exam component
            const componentScores: number[] = [];
            let total = 0;
            
            for (let i = 0; i < examComponents.length; i++) {
              const score = parseInt(row[colPos + i] || '0') || 0;
              componentScores.push(score);
              total += score;
            }

            console.log(`  ${subject}: ${examComponents.map((c, i) => `${c.name}=${componentScores[i]}`).join(', ')}, Total=${total}`);

            // Map component scores to dynamic property names based on exam config
            const subjectResultData: any = {
              name: subject,
              score: total,
              grade: total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F',
              color: 'blue' as const,
              remark: total >= 70 ? 'Good' : total >= 60 ? 'Average' : 'Needs Improvement',
              classAverage: 0,
              positionInClass: 0,
            };

            // Dynamically add component scores with standardized names
            // For compatibility with gradebook, also keep CA1, CA2, Project, Exam if those components exist
            examComponents.forEach((component, idx) => {
              // Use component name as key (e.g., "CA 1", "Exam")
              subjectResultData[component.name.toLowerCase().replace(/\s+/g, '_')] = componentScores[idx];
              
              // For backward compatibility with gradebook display, map to standard names if they match
              const compName = component.name.toLowerCase();
              if (compName.includes('ca') && compName.includes('1')) subjectResultData.ca1 = componentScores[idx];
              if (compName.includes('ca') && compName.includes('2')) subjectResultData.ca2 = componentScores[idx];
              if (compName.includes('project')) subjectResultData.project = componentScores[idx];
              if (compName.includes('exam') || compName.includes('final')) subjectResultData.exam = componentScores[idx];
            });

            subjectResults.push(subjectResultData);
          }
        }

        // Extract affective domain traits - include ALL traits from CSV headers
        const affectiveDomainData: Record<string, number> = {};
        for (const trait in affectiveDomainTraits) {
          const colPos = affectiveDomainTraits[trait];
          const score = parseInt(row[colPos] || '0') || 0;
          // Include all traits, even if score is 0 (just show as '-' or 0 in display)
          affectiveDomainData[trait] = score > 0 ? Math.min(5, Math.max(1, score)) : 0;
          console.log(`  Affective: ${trait} = ${affectiveDomainData[trait]}`);
        }

        // Extract psychomotor domain skills - include ALL skills from CSV headers
        const psychomotorDomainData: Record<string, number> = {};
        for (const skill in psychomotorDomainSkills) {
          const colPos = psychomotorDomainSkills[skill];
          const score = parseInt(row[colPos] || '0') || 0;
          // Include all skills, even if score is 0 (just show as '-' or 0 in display)
          psychomotorDomainData[skill] = score > 0 ? Math.min(5, Math.max(1, score)) : 0;
          console.log(`  Psychomotor: ${skill} = ${psychomotorDomainData[skill]}`);
        }

        // Extract comments from last 2 columns
        const principalComments = row[row.length - 2]?.trim() || '';
        const classTeacherComments = row[row.length - 1]?.trim() || '';
        console.log(`  Principal Comments: ${principalComments}`);
        console.log(`  Class Teacher Comments: ${classTeacherComments}`);

        // Calculate overall average
        const totalScores = subjectResults.reduce((sum, s) => sum + s.score, 0);
        const overallAverage = subjectResults.length > 0 ? totalScores / subjectResults.length : 0;

        gradebookPreviews.push({
          studentName,
          admissionNumber,
          classLevel: selectedClassObj?.name || 'Class',
          session: sessionData.sessionName,
          term: sessionData.termName,
          resultType: 'MID-TERM',
          position: '1', // Placeholder, will be calculated later
          positionInSchool: 1,
          totalStudents: dataRows.length,
          sex: sex === '-' ? 'M' : sex,
          age: age,
          height: height,
          weight: weight,
          dateOfBirth: dateOfBirth,
          favouriteColor: favouriteColor,
          subjects: subjectResults,
          totalObtainable: subjectResults.length * 100,
          overallAverage: overallAverage,
          attendance: {
            daysPresent: daysPresent,
            daysSchoolOpen: 70, // Standard school term days
          },
          affectiveDomain: affectiveDomainData,
          psychomotorDomain: psychomotorDomainData,
          teacherComments: {
            principal: principalComments,
            classTeacher: classTeacherComments,
          },
          staffInfo: staffInfo,
        } as SchoolResult);
      }

      // CALCULATE CLASS AVERAGES, POSITIONS AND REMARKS FROM PARSED CSV DATA
      if (gradebookPreviews.length > 0) {
        // Calculate overall class positions based on overall average
        const sortedByAverage = [...gradebookPreviews].map((student, idx) => ({
          studentIndex: idx,
          average: student.overallAverage || 0,
        })).sort((a, b) => b.average - a.average);
        
        // Assign positions and remarks
        const positionMap: Record<number, number> = {};
        const generateRemark = (avg: number): string => {
          if (avg >= 80) return 'Excellent';
          if (avg >= 70) return 'Very Good';
          if (avg >= 60) return 'Good';
          if (avg >= 50) return 'Average';
          return 'Needs Improvement';
        };
        
        for (let i = 0; i < sortedByAverage.length; i++) {
          if (i > 0 && sortedByAverage[i].average === sortedByAverage[i - 1].average) {
            positionMap[sortedByAverage[i].studentIndex] = positionMap[sortedByAverage[i - 1].studentIndex];
          } else {
            positionMap[sortedByAverage[i].studentIndex] = i + 1;
          }
        }
        
        // Update gradebook previews with positions and remarks
        for (let i = 0; i < gradebookPreviews.length; i++) {
          gradebookPreviews[i].position = `${positionMap[i]}`;
          gradebookPreviews[i].overallRemark = generateRemark(gradebookPreviews[i].overallAverage || 0);
        }

        const subjectNames = gradebookPreviews[0].subjects.map(s => s.name);
        
        for (const subjectName of subjectNames) {
          // Get all scores for this subject
          const subjectScores = gradebookPreviews.map((student, idx) => ({
            studentIndex: idx,
            score: student.subjects.find(s => s.name === subjectName)?.score || 0,
          }));

          // Calculate class average
          const classAverage = subjectScores.length > 0
            ? Math.round((subjectScores.reduce((sum, s) => sum + s.score, 0) / subjectScores.length) * 100) / 100
            : 0;

          // Sort by score for positions (handle ties)
          const sorted = [...subjectScores].sort((a, b) => b.score - a.score);
          const positionMap: Record<number, number> = {};
          
          for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i].score === sorted[i - 1].score) {
              positionMap[sorted[i].studentIndex] = positionMap[sorted[i - 1].studentIndex];
            } else {
              positionMap[sorted[i].studentIndex] = i + 1;
            }
          }

          // Update gradebook previews
          for (let i = 0; i < gradebookPreviews.length; i++) {
            const subject = gradebookPreviews[i].subjects.find(s => s.name === subjectName);
            if (subject) {
              subject.classAverage = classAverage;
              subject.positionInClass = positionMap[i] || 0;
            }
          }
        }
      }

      if (gradebookPreviews.length === 0) {
        throw new Error('No valid student data found in CSV');
      }

      console.log('✅ Gradebooks created:', gradebookPreviews);

      // Store gradebooks data using the backend endpoint
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('classId', selectedClass);

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/process-csv',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Results uploaded and gradebooks generated successfully',
        });

        setPreviewGradebooks(gradebookPreviews);
        setSelectedStudentIndex(0);
        setProcessingComplete(true);
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.error || error.message || 'Failed to process CSV';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToDashboard = async () => {
    try {
      if (!instanceName.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter an instance name',
          variant: 'destructive',
        });
        return;
      }

      setSavingInstance(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const sessionId = sessionTermData?.sessionId || localStorage.getItem('sessionId');
      const termId = sessionTermData?.termId || localStorage.getItem('termId');

      // Build CSV content from gradebook data
      let csvContent = '';
      if (csvFile) {
        csvContent = await csvFile.text();
      }

      // Prepare instance data
      const instanceData = {
        classId: selectedClass,
        sessionId,
        termId,
        instanceName,
        sessionName: sessionTermData?.sessionName,
        termName: sessionTermData?.termName,
        examConfigComponents: examComponents,
        affectiveTraits: affectiveTraits,
        psychomotorSkills: psychomotorSkills,
        csvFileName: csvFile?.name || 'results.csv',
        gradebookData: previewGradebooks,
        totalStudents: previewGradebooks.length,
      };

      console.log('💾 Saving results instance:', instanceData);

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/instances',
        instanceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Results saved as instance: ${instanceName}`,
        });

        // Redirect to results entry page or dashboard
        window.location.href = '/school-admin/results-entry';
      }
    } catch (error: any) {
      console.error('Error saving instance:', error);
      const message = error.response?.data?.error || error.message || 'Failed to save instance';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSavingInstance(false);
    }
  };

  if (processingComplete && school && template && previewGradebooks.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ✓ Gradebook Preview
          </h2>
          <p className="text-gray-400 text-sm">
            Print-ready gradebooks for the first 5 students. Click any to view full page.
          </p>
        </div>

        {/* Student Selector */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Select Student to View</label>
          <select
            value={selectedStudentIndex}
            onChange={(e) => setSelectedStudentIndex(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          >
            {previewGradebooks.map((student, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {student.studentName} ({student.admissionNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Single Printable Gradebook */}
        {previewGradebooks[selectedStudentIndex] && school && template && (
          <div className="border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden bg-gray-950">
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20 flex justify-between items-center">
              <h3 className="text-white font-semibold">
                Gradebook for {previewGradebooks[selectedStudentIndex].studentName} ({previewGradebooks[selectedStudentIndex].admissionNumber})
              </h3>
              <button
                onClick={() => {
                  const printArea = document.getElementById('gradebook-print-area');
                  if (printArea) {
                    const printWindow = window.open('', '', 'height=800,width=1000');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Gradebook</title></head><body>');
                      printWindow.document.write(printArea.innerHTML);
                      printWindow.document.write('</body></html>');
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1 text-blue-300 hover:text-blue-200 text-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
            <div id="gradebook-print-area" className="p-2 bg-gray-950 flex justify-center overflow-x-auto">
              <CompactGradebook
                school={school}
                result={previewGradebooks[selectedStudentIndex]}
                template={template}
                examComponents={examComponents}
                previewMode={true}
              />
            </div>
          </div>
        )}

        <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            ✓ All {previewGradebooks.length} students' results have been successfully processed and stored in the database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[rgba(255,255,255,0.07)] pt-8 flex gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setProcessingComplete(false);
              setCsvFile(null);
              setPreviewGradebooks([]);
              setSchool(null);
              setTemplate(null);
            }}
            className="bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Upload Another Class
          </Button>
          <Button
            onClick={() => setShowInstanceNameDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save as Instance
          </Button>
        </div>

        {/* Instance Name Dialog */}
        {showInstanceNameDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Save Results as Instance</h3>
              <p className="text-gray-400 text-sm mb-4">
                Give this results set a name to save it. You can create multiple instances per term.
              </p>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="e.g., Form 4 Mid-Term 2025"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInstanceNameDialog(false)}
                  disabled={savingInstance}
                  className="flex-1 bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToDashboard}
                  disabled={savingInstance || !instanceName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingInstance ? 'Saving...' : 'Save Instance'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Results CSV Upload
        </h2>
        <p className="text-gray-400 text-sm">
          Download the template, fill in student results with scores and comments, then upload to generate gradebooks
        </p>
      </div>

      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Class Selection */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Select Class *</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          >
            <option value="">-- Choose a class --</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {selectedClass && (
            <p className="text-gray-400 text-xs mt-1">
              {students.filter(s => s.classId === selectedClass).length} student(s) in this class
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Template includes:</strong> {selectedClass ? students.filter(s => s.classId === selectedClass).length : 0} students • {subjects.length} subjects • {affectiveTraits.length > 0 ? affectiveTraits.length : 8} affective traits • {psychomotorSkills.length > 0 ? psychomotorSkills.length : 5} psychomotor skills
          </p>
          <p className="text-blue-300 text-xs mt-2">
            <strong>Note:</strong> The first row (Example Student) is provided as a guide for entering data. Remove it before uploading. Default affective traits and psychomotor skills are used if not configured.
          </p>
        </div>

        {/* Download Template */}
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-400/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">CSV Template</h3>
              <p className="text-gray-400 text-sm">Pre-populated with student names and admission numbers</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-3 block">Upload Completed CSV *</label>
          <div
            className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.name.endsWith('.csv')) {
                handleFileSelect(file);
              } else {
                toast({
                  title: 'Error',
                  description: 'Please select a CSV file',
                  variant: 'destructive',
                });
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {csvFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-green-400 text-2xl">✓</div>
                <p className="text-white text-sm font-medium">{csvFile.name}</p>
                <p className="text-gray-500 text-xs">{(csvFile.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => {
                    setPreview(null);
                    setCsvFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                      fileInputRef.current.click();
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2"
                >
                  Choose Different File
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <span className="text-gray-300 text-sm">Click to upload or drag and drop</span>
                <span className="text-gray-500 text-xs">CSV files only</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview && preview.headers && (
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
            <h3 className="text-white text-sm font-semibold mb-3">CSV Preview (first 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {preview.headers.map((header, idx) => (
                      <th key={idx} className="px-3 py-2 text-left text-gray-400 font-medium text-xs bg-[rgba(255,255,255,0.05)]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, idx) => (
                    <tr key={idx} className="border-t border-[rgba(255,255,255,0.05)]">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-300 text-xs">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-[rgba(255,255,255,0.07)] pt-8 flex gap-4 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading || uploading}
          className="bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || uploading || !csvFile}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {uploading ? 'Processing...' : 'Complete Setup & Generate Gradebooks'}
        </Button>
      </div>
    </div>
  );
};

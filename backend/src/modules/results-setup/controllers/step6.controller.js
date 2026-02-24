export async function handleStep6(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { sessionId, termId, importedCount } = req.body;
        // Validate that user is authenticated
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate that CSV file was provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'CSV file is required',
            });
        }
        // Parse CSV file with custom header handling
        const csvContent = req.file.buffer.toString('utf-8');
        const lines = csvContent.split('\n').map((line) => line.trim());
        // Extract headers from both rows
        // Row 0: Category headers (Student ID, Name, Attendance, Sex, DOB, ..., Subject1, "", Subject2, "", ..., Affective Domains, ..., Comments)
        const categoryHeaderLine = lines[0];
        const categoryHeaders = categoryHeaderLine.split(',').map((h) => h.trim());
        // Row 1: Detail headers (with format notes in parens, exam names, domain names, etc.)
        const detailHeaderLine = lines[1];
        const detailHeaders = detailHeaderLine.split(',').map((h) => h.trim());
        // Build merged headers intelligently
        // For personal info columns (first 9): use category header
        // For exam/domain columns: combine category + detail to preserve subject names
        const headers = categoryHeaders.map((cat, i) => {
            const detail = detailHeaders[i] || '';
            // For first 9 columns (personal info), use category name only
            if (i < 9) {
                return cat;
            }
            // For exam columns, combine subject name (cat) with exam info (detail)
            // If cat is non-empty (subject name), use both; if empty (merged cell), just use detail
            if (cat && cat !== 'Comments' && detail) {
                return `${cat} - ${detail}`;
            }
            // If only detail has content, use it
            if (detail) {
                return detail;
            }
            // If only category has content, use it
            return cat;
        });
        // Detect affective and psychomotor domain columns by header structure
        const affectiveDomainColumns = [];
        const psychomotorDomainColumns = [];
        let inAffectiveDomains = false;
        let inPsychomotorDomains = false;
        for (let i = 0; i < categoryHeaders.length; i++) {
            const header = categoryHeaders[i].trim();
            if (header === 'Affective Domains') {
                inAffectiveDomains = true;
                inPsychomotorDomains = false;
                continue;
            }
            if (header === 'Psychomotor Domains') {
                inAffectiveDomains = false;
                inPsychomotorDomains = true;
                continue;
            }
            if (header === 'Comments' || (header === '' && i > 0 && categoryHeaders[i - 1] === 'Comments')) {
                // Stop collecting domains when we hit Comments section
                inAffectiveDomains = false;
                inPsychomotorDomains = false;
            }
            // If we're in affective domains section, collect the column
            if (inAffectiveDomains && (header === '' || header === 'Affective Domains')) {
                const detailHeader = detailHeaders[i]?.trim();
                if (detailHeader && detailHeader !== '') {
                    affectiveDomainColumns.push({ name: detailHeader, index: i });
                }
            }
            // If we're in psychomotor domains section, collect the column
            if (inPsychomotorDomains && (header === '' || header === 'Psychomotor Domains')) {
                const detailHeader = detailHeaders[i]?.trim();
                if (detailHeader && detailHeader !== '') {
                    psychomotorDomainColumns.push({ name: detailHeader, index: i });
                }
            }
        }
        // Parse data starting from row 4 (skip header row, sub-header row, and example row)
        const records = [];
        for (let i = 3; i < lines.length; i++) {
            const line = lines[i];
            if (!line)
                continue; // Skip empty lines
            const cells = line.split(',').map((cell) => cell.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = cells[index] || '';
            });
            // Only add if has Student ID
            const studentId = row['Student ID'] || '';
            if (studentId && studentId !== 'Student ID') {
                records.push(row);
            }
        }
        const finalImportedCount = records.length;
        console.log(`✅ CSV file parsed successfully. Records: ${finalImportedCount}`);
        console.log(`📊 Detected ${affectiveDomainColumns.length} affective domain(s) and ${psychomotorDomainColumns.length} psychomotor domain(s)`);
        // Extract and structure student data for preview
        const structuredData = records.map((row) => {
            // Parse the actual cells from the raw line to access by index
            const line = lines[records.indexOf(row) + 3]; // +3 because rows start at index 3
            const cells = line.split(',').map((cell) => cell.trim());
            // Find the attendance column key (it might be "(days / X available)" or "Attendance")
            const attendanceKey = Object.keys(row).find(key => key.includes('days') || key === 'Attendance' || key === 'Attendance') || 'Attendance';
            // Extract personal info fields from CSV
            const personalInfo = {
                sex: row['Sex'] || row['sex'] || '',
                dateOfBirth: row['DOB'] || row['dob'] || row['Date of Birth'] || '',
                age: row['Age'] || row['age'] ? parseInt(row['Age'] || row['age']) : undefined,
                height: row['Height'] || row['height'] || '',
                weight: row['Weight'] || row['weight'] || '',
                favouriteColor: row['Favourite Color'] || row['favourite Color'] || row['Color'] || '',
            };
            // Extract affective domain values by column index
            const affectiveDomains = {};
            affectiveDomainColumns.forEach(({ name, index }) => {
                const value = cells[index]?.trim() || '';
                if (value) {
                    affectiveDomains[name] = parseInt(value) || value;
                }
            });
            // Extract psychomotor domain values by column index
            const psychomotorDomains = {};
            psychomotorDomainColumns.forEach(({ name, index }) => {
                const value = cells[index]?.trim() || '';
                if (value) {
                    psychomotorDomains[name] = isNaN(parseInt(value)) ? value : parseInt(value);
                }
            });
            return {
                studentId: row['Student ID']?.trim() || '',
                name: row['Name']?.trim() || '',
                attendance: row[attendanceKey]
                    ? parseInt(row[attendanceKey])
                    : 0,
                personalInfo,
                affectiveDomains,
                psychomotorDomains,
                rawRow: row, // Keep raw row for flexible parsing based on step2/3/4 config
                comments: {
                    principal: row['Principal Comments']?.trim() || '',
                    formTutor: row['Form Tutor Comments']?.trim() || '',
                },
            };
        });
        console.log(`📊 Structured student data:`, structuredData.length, 'students');
        res.json({
            success: true,
            message: `CSV parsed successfully. Ready for preview.`,
            data: {
                importedCount: finalImportedCount,
                fileName: req.file.originalname,
                students: structuredData.slice(0, 3), // First 3 for preview
                allStudents: structuredData, // All for final save
                previewMode: true,
            },
        });
    }
    catch (error) {
        console.error('Step 6 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to import results',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step6.controller.js.map
import { Request, Response } from 'express';
import multer from 'multer';
import { CSVProcessorService } from '../services/csv-processor.service';
import { ResultsSetupService } from '../services/results-setup.service';

const csvProcessorService = new CSVProcessorService();
const resultsSetupService = new ResultsSetupService();

export async function processCSV(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Get file from multipart form data
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Get session data to find current session/term
    const session = await resultsSetupService.getSession(schoolId);
    if (!session) {
      return res.status(400).json({
        success: false,
        error: 'No active results setup session',
        code: 'VALIDATION_ERROR',
      });
    }

    // Extract data from session fields
    const sessionId = session.sessionId;
    const termId = session.termId;
    
    // Get classId from request (should be sent from frontend)
    const classId = req.body.classId || req.query.classId;
    
    if (!classId || !sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'Session, term, and class selection required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Parse exam components to get subject names
    const examComponents = session.examConfigComponents 
      ? JSON.parse(session.examConfigComponents) 
      : [];
    const subjects = examComponents.map((c: any) => c.name) || [];

    // Read CSV file content
    const csvContent = req.file.buffer.toString('utf-8');

    // Process CSV
    const result = await csvProcessorService.processCSV(
      csvContent,
      schoolId,
      classId as string,
      sessionId as string,
      termId as string,
      subjects
    );

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}

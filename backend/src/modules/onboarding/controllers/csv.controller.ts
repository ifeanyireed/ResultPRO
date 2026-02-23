import { Request, Response } from 'express';
import { csvService } from '../services/csv.service';

export class CSVController {
  /**
   * GET /api/csv/template
   * Get CSV template for school
   */
  static async getTemplate(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const template = await csvService.getCSVTemplate(schoolId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ResultsTemplate.csv"');
      res.send(template);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * POST /api/csv/validate
   * Validate CSV content before import
   */
  static async validateCSV(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const { csvContent, sessionId, termId } = req.body;

      if (!csvContent) {
        return res.status(400).json({
          success: false,
          error: 'CSV content is required',
          code: 'MISSING_CSV_CONTENT',
        });
      }

      if (!sessionId || !termId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID and Term ID are required',
          code: 'MISSING_SESSION_OR_TERM',
        });
      }

      const validationResult = await csvService.validateCSV(
        schoolId,
        csvContent,
        sessionId,
        termId
      );

      res.json({
        success: true,
        data: validationResult,
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

  /**
   * POST /api/csv/preview
   * Preview parsed CSV data
   */
  static async previewCSV(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const { csvContent } = req.body;

      if (!csvContent) {
        return res.status(400).json({
          success: false,
          error: 'CSV content is required',
          code: 'MISSING_CSV_CONTENT',
        });
      }

      const data = await csvService.extractCSVData(csvContent);
      const preview = data.slice(0, 5); // First 5 rows

      res.json({
        success: true,
        data: {
          totalRows: data.length,
          preview,
          columns: Object.keys(data[0] || {}),
        },
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
}

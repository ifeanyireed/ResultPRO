import { Request, Response } from 'express';
import { ResultsInstanceService } from '../services/results-instance.service';

const service = new ResultsInstanceService();

export async function createInstance(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const {
      classId,
      sessionId,
      termId,
      instanceName,
      examConfigComponents,
      affectiveTraits,
      psychomotorSkills,
      csvFileName,
      csvFileUrl,
      gradebookData,
      totalStudents,
    } = req.body;

    // Validate required fields
    if (!classId || !sessionId || !termId || !instanceName) {
      return res.status(400).json({
        success: false,
        error: 'classId, sessionId, termId, and instanceName are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const instance = await service.createInstance({
      schoolId,
      classId,
      sessionId,
      termId,
      instanceName,
      examConfigComponents: examConfigComponents || [],
      affectiveTraits: affectiveTraits || [],
      psychomotorSkills: psychomotorSkills || [],
      csvFileName,
      csvFileUrl,
      gradebookData: gradebookData || [],
      totalStudents: totalStudents || 0,
      createdBy: req.user?.id,
    });

    res.json({
      success: true,
      message: 'Results instance created successfully',
      data: instance,
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

export async function getActiveInstance(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const { classId, sessionId, termId } = req.params;

    if (!schoolId || !classId || !sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'schoolId, classId, sessionId, and termId are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const instance = await service.getActiveInstance(schoolId, classId, sessionId, termId);

    res.json({
      success: true,
      data: instance,
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

export async function listInstances(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { classId, sessionId, status } = req.query;

    const instances = await service.listInstances(schoolId, {
      classId: classId as string,
      sessionId: sessionId as string,
      status: status as string,
    });

    res.json({
      success: true,
      data: instances,
      count: instances.length,
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

export async function getInstance(req: Request, res: Response) {
  try {
    const { instanceId } = req.params;

    if (!instanceId) {
      return res.status(400).json({
        success: false,
        error: 'Instance ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const instance = await service.getInstance(instanceId);

    res.json({
      success: true,
      data: instance,
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

export async function archiveInstance(req: Request, res: Response) {
  try {
    const { instanceId } = req.params;

    if (!instanceId) {
      return res.status(400).json({
        success: false,
        error: 'Instance ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const instance = await service.archiveInstance(instanceId, req.user?.id);

    res.json({
      success: true,
      message: 'Instance archived successfully',
      data: instance,
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

export async function deleteInstance(req: Request, res: Response) {
  try {
    const { instanceId } = req.params;

    if (!instanceId) {
      return res.status(400).json({
        success: false,
        error: 'Instance ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    await service.deleteInstance(instanceId);

    res.json({
      success: true,
      message: 'Instance deleted successfully',
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

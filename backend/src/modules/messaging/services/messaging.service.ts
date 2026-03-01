import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MessagingService {
  /**
   * Send message from teacher to parent about a student
   */
  static async sendTeacherMessage(
    teacherId: string,
    parentId: string,
    studentId: string,
    schoolId: string,
    body: string,
    subject?: string
  ) {
    // Verify teacher exists and has TEACHER role
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Invalid teacher');
    }

    // Verify parent exists and has PARENT role
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.role !== 'PARENT') {
      throw new Error('Invalid parent');
    }

    // Verify student exists and belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new Error('Invalid student');
    }

    // Verify teacher teaches this student's class
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        classId: student.classId,
        createdById: teacherId,
      },
    });

    if (!classSubject) {
      throw new Error('Teacher does not teach this student');
    }

    // Create message
    const message = await prisma.teacherParentMessage.create({
      data: {
        schoolId,
        teacherId,
        parentId,
        studentId,
        senderRole: 'TEACHER',
        senderUserId: teacherId,
        subject: subject || `Message about ${student.name}`,
        body,
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: {
          select: { id: true, name: true },
        },
      },
    });

    return message;
  }

  /**
   * Send message from parent to teacher about a student
   */
  static async sendParentMessage(
    parentId: string,
    teacherId: string,
    studentId: string,
    schoolId: string,
    body: string,
    subject?: string
  ) {
    // Verify parent exists and has PARENT role
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.role !== 'PARENT') {
      throw new Error('Invalid parent');
    }

    // Verify teacher exists and has TEACHER role
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Invalid teacher');
    }

    // Verify student exists and belongs to school, parent is linked to student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, parent: true },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new Error('Invalid student');
    }

    if (student.parent?.userId !== parentId) {
      throw new Error('Parent not linked to this student');
    }

    // Verify teacher teaches this student's class
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        classId: student.classId,
        createdById: teacherId,
      },
    });

    if (!classSubject) {
      throw new Error('Teacher does not teach this student');
    }

    // Create message
    const message = await prisma.teacherParentMessage.create({
      data: {
        schoolId,
        teacherId,
        parentId,
        studentId,
        senderRole: 'PARENT',
        senderUserId: parentId,
        subject: subject || `Message about ${student.name}`,
        body,
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: {
          select: { id: true, name: true },
        },
      },
    });

    return message;
  }

  /**
   * Get message thread between teacher and parent
   */
  static async getMessageThread(
    userId: string,
    otherUserId: string,
    studentId: string,
    schoolId: string,
    limit: number = 50
  ) {
    const messages = await prisma.teacherParentMessage.findMany({
      where: {
        schoolId,
        studentId,
        OR: [
          {
            AND: [
              { senderUserId: userId },
              {
                OR: [
                  { teacherId: otherUserId },
                  { parentId: otherUserId },
                ],
              },
            ],
          },
          {
            AND: [
              { senderUserId: otherUserId },
              {
                OR: [
                  { teacherId: userId },
                  { parentId: userId },
                ],
              },
            ],
          },
        ],
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Mark messages as read
    await prisma.teacherParentMessage.updateMany({
      where: {
        schoolId,
        studentId,
        senderUserId: otherUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Get conversations list for teacher (all parents they've communicated with)
   */
  static async getTeacherConversations(teacherId: string, schoolId: string) {
    // Get all unique parent-student pairs this teacher has messaged
    const conversations = await prisma.teacherParentMessage.findMany({
      where: {
        schoolId,
        teacherId,
      },
      distinct: ['parentId', 'studentId'],
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: {
          select: { id: true, name: true },
        },
      },
    });

    // Get unread count for each conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.teacherParentMessage.count({
          where: {
            schoolId,
            parentId: conv.parentId,
            studentId: conv.studentId,
            senderUserId: conv.parentId,
            isRead: false,
          },
        });

        // Get last message
        const lastMessage = await prisma.teacherParentMessage.findFirst({
          where: {
            schoolId,
            parentId: conv.parentId,
            studentId: conv.studentId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          ...conv,
          unreadCount,
          lastMessage,
        };
      })
    );

    return withUnread;
  }

  /**
   * Get conversations list for parent (all teachers they've communicated with)
   */
  static async getParentConversations(parentId: string, schoolId: string) {
    const parentUser = await prisma.user.findUnique({
      where: { id: parentId },
    });

    if (!parentUser) {
      throw new Error('Parent not found');
    }

    // Get all student-teacher pairs this parent has messaged
    const conversations = await prisma.teacherParentMessage.findMany({
      where: {
        schoolId,
        parentId,
      },
      distinct: ['teacherId', 'studentId'],
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: {
          select: { id: true, name: true },
        },
      },
    });

    // Get unread count for each conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.teacherParentMessage.count({
          where: {
            schoolId,
            teacherId: conv.teacherId,
            studentId: conv.studentId,
            senderUserId: conv.teacherId,
            isRead: false,
          },
        });

        // Get last message
        const lastMessage = await prisma.teacherParentMessage.findFirst({
          where: {
            schoolId,
            teacherId: conv.teacherId,
            studentId: conv.studentId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          ...conv,
          unreadCount,
          lastMessage,
        };
      })
    );

    return withUnread;
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(userId: string, schoolId: string) {
    const count = await prisma.teacherParentMessage.count({
      where: {
        schoolId,
        OR: [
          { teacherId: userId, senderUserId: { not: userId } },
          { parentId: userId, senderUserId: { not: userId } },
        ],
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string) {
    const message = await prisma.teacherParentMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return message;
  }
}

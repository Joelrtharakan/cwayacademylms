import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getExtensionRequests = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  try {
    const requests = await prisma.extensionRequest.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching extension requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch extension requests" });
  }
};

export const getStudentExtensionRequests = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.id;

  if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const requests = await prisma.extensionRequest.findMany({
      where: { courseId, studentId },
    });
    
    const granted = await prisma.extension.findMany({
      where: { courseId, studentId },
    });

    res.json({ success: true, data: { requests, granted } });
  } catch (error) {
    console.error("Error fetching student extensions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch student extensions" });
  }
};

export const createExtensionRequest = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.id;
  const { itemId, itemType, reason, requestedDate } = req.body;

  if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    // Check if pending request already exists
    const existing = await prisma.extensionRequest.findFirst({
      where: { studentId, itemId, status: "PENDING" }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "A pending request already exists for this item" });
    }

    const request = await prisma.extensionRequest.create({
      data: {
        studentId,
        courseId,
        itemId,
        itemType,
        reason,
        requestedDate: requestedDate ? new Date(requestedDate) : null,
        status: "PENDING"
      }
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("Error creating extension request:", error);
    res.status(500).json({ success: false, message: "Failed to create extension request" });
  }
};

export const updateExtensionRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params; // Request ID
  const { status, extendedDate } = req.body;

  try {
    const request = await prisma.extensionRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Update request status
    const updated = await prisma.extensionRequest.update({
      where: { id },
      data: { status }
    });

    // If approved, create or update the actual Extension record
    if (status === "APPROVED" && extendedDate) {
      await prisma.extension.upsert({
        where: {
          studentId_itemId: {
            studentId: request.studentId,
            itemId: request.itemId,
          }
        },
        create: {
          studentId: request.studentId,
          itemId: request.itemId,
          itemType: request.itemType,
          courseId: request.courseId,
          extendedDate: new Date(extendedDate),
        },
        update: {
          extendedDate: new Date(extendedDate),
        }
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating extension request:", error);
    res.status(500).json({ success: false, message: "Failed to update extension request" });
  }
};

export const createManualExtension = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { studentId, itemId, itemType, extendedDate } = req.body;

  try {
    const extension = await prisma.extension.upsert({
      where: {
        studentId_itemId: {
          studentId,
          itemId,
        }
      },
      create: {
        studentId,
        itemId,
        itemType,
        courseId,
        extendedDate: new Date(extendedDate),
      },
      update: {
        extendedDate: new Date(extendedDate),
      }
    });

    res.json({ success: true, data: extension });
  } catch (error) {
    console.error("Error creating manual extension:", error);
    res.status(500).json({ success: false, message: "Failed to create extension" });
  }
};

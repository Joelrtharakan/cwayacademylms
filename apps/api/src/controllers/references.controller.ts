import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/errors";

const prisma = new PrismaClient();

// Get reference details by token
export const getReferenceByToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ status: "error", message: "Token is required" });
  }

  // Find the application with this token
  const application1 = await prisma.programApplication.findUnique({
    where: { reference1Token: token },
    include: { program: true }
  });

  const application2 = await prisma.programApplication.findUnique({
    where: { reference2Token: token },
    include: { program: true }
  });

  const application = application1 || application2;

  if (!application) {
    return res.status(404).json({ status: "error", message: "Invalid or expired reference token" });
  }

  const isReference1 = !!application1;
  const status = isReference1 ? application.reference1Status : application.reference2Status;

  if (status === "SUBMITTED") {
    return res.status(400).json({ status: "error", message: "This reference form has already been submitted." });
  }

  const refereeData = isReference1 ? {
    name: application.reference1Name,
    email: application.reference1Email,
    type: application.reference1Type || "General Reference",
    relation: application.reference1Relation
  } : {
    name: application.reference2Name,
    email: application.reference2Email,
    type: application.reference2Type || "General Reference",
    relation: application.reference2Relation
  };

  res.status(200).json({
    status: "success",
    data: {
      applicationId: application.id,
      applicantName: application.fullName,
      programName: application.program.title,
      referenceIndex: isReference1 ? 1 : 2,
      refereeData
    }
  });
});

// Submit a reference form
export const submitReference = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const formData = req.body;

  if (!token) {
    return res.status(400).json({ status: "error", message: "Token is required" });
  }

  // Find the application with this token
  const application1 = await prisma.programApplication.findUnique({
    where: { reference1Token: token }
  });

  const application2 = await prisma.programApplication.findUnique({
    where: { reference2Token: token }
  });

  const application = application1 || application2;

  if (!application) {
    return res.status(404).json({ status: "error", message: "Invalid or expired reference token" });
  }

  const isReference1 = !!application1;
  const status = isReference1 ? application.reference1Status : application.reference2Status;

  if (status === "SUBMITTED") {
    return res.status(400).json({ status: "error", message: "This reference form has already been submitted." });
  }

  // Create the reference form
  await prisma.$transaction(async (tx) => {
    // 1. Create reference form response
    await tx.referenceForm.create({
      data: {
        applicationId: application.id,
        referenceIndex: isReference1 ? 1 : 2,
        type: formData.type,
        
        yearsKnown: formData.yearsKnown,
        capacityKnown: formData.capacityKnown,
        churchEngagement: formData.churchEngagement,
        spiritualInfluence: formData.spiritualInfluence,
        
        ratings: JSON.stringify(formData.ratings || {}),
        
        financialAbility: formData.financialAbility,
        financialHelp: formData.financialHelp,
        
        comments: formData.comments,
        attentionAreas: formData.attentionAreas,
        discussFurther: formData.discussFurther === 'Yes' || formData.discussFurther === true,
        recommendation: formData.recommendation,
        
        refereeName: formData.refereeName,
        refereePosition: formData.refereePosition,
        churchName: formData.churchName,
        denomination: formData.denomination,
        
        address: JSON.stringify(formData.address || {}),
        phone: formData.phone,
        email: formData.email,
        
        signatureUrl: formData.signatureUrl
      }
    });

    // 2. Update application status
    if (isReference1) {
      await tx.programApplication.update({
        where: { id: application.id },
        data: { reference1Status: "SUBMITTED" }
      });
    } else {
      await tx.programApplication.update({
        where: { id: application.id },
        data: { reference2Status: "SUBMITTED" }
      });
    }
  });

  res.status(200).json({
    status: "success",
    message: "Reference form submitted successfully"
  });
});

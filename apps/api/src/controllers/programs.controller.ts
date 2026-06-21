import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { uploadToR2, generateKey } from "../services/storage.service";

export const getProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      courses: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { sections: true } } }
      }
    }
  });
  if (!program) throw new AppError("Program not found", 404);
  res.json({ status: "success", data: program });
});

export const applyForProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) throw new AppError("Program not found", 404);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  if (!files || !files["photo"] || files["photo"].length === 0) {
    throw new AppError("Passport photo is required", 400);
  }
  
  // Upload photo
  const photoFile = files["photo"][0];
  const photoKey = generateKey("applications/photos", `${Date.now()}-${photoFile.originalname}`);
  const { url: photoUrl } = await uploadToR2(photoFile.buffer, photoKey, photoFile.mimetype);

  // Upload certificates
  const certificatesUrls: string[] = [];
  if (files["certificates"] && files["certificates"].length > 0) {
    for (const certFile of files["certificates"]) {
      const certKey = generateKey("applications/certificates", `${Date.now()}-${certFile.originalname}`);
      const { url } = await uploadToR2(certFile.buffer, certKey, certFile.mimetype);
      certificatesUrls.push(url);
    }
  }

  const {
    mediumOfStudy, fullName, dob, gender, maritalStatus, nationality, aadhaarNumber,
    mobileNumber, whatsappNumber, email,
    permanentAddressLine1, permanentAddressLine2, permanentCity, permanentState, permanentPostalCode, permanentCountry,
    currentAddressLine1, currentAddressLine2, currentCity, currentState, currentPostalCode, currentCountry,
    highestQualification, previousInstitution, yearOfCompletion, marksOrGrade,
    isBornAgain, churchName, churchAddressLine1, churchAddressLine2, churchCity, churchState, churchPostalCode, churchCountry,
    pastorName, ministryExperience, callingStatement,
    reference1Name, reference1Phone, reference1Relation,
    reference2Name, reference2Phone, reference2Relation,
    declarationName
  } = req.body;

  const application = await prisma.programApplication.create({
    data: {
      programId: id,
      mediumOfStudy,
      fullName,
      dob: new Date(dob),
      gender,
      maritalStatus,
      nationality,
      aadhaarNumber,
      passportPhotoUrl: photoUrl,
      mobileNumber,
      whatsappNumber,
      email,
      
      permanentAddress: JSON.stringify({
        line1: permanentAddressLine1,
        line2: permanentAddressLine2,
        city: permanentCity,
        state: permanentState,
        postalCode: permanentPostalCode,
        country: permanentCountry
      }),
      
      currentAddress: JSON.stringify({
        line1: currentAddressLine1,
        line2: currentAddressLine2,
        city: currentCity,
        state: currentState,
        postalCode: currentPostalCode,
        country: currentCountry
      }),
      
      highestQualification,
      previousInstitution,
      yearOfCompletion,
      marksOrGrade,
      certificatesUrls: JSON.stringify(certificatesUrls),
      
      isBornAgain: isBornAgain === "true" || isBornAgain === true,
      churchName,
      churchAddress: JSON.stringify({
        line1: churchAddressLine1,
        line2: churchAddressLine2,
        city: churchCity,
        state: churchState,
        postalCode: churchPostalCode,
        country: churchCountry
      }),
      pastorName,
      ministryExperience,
      callingStatement,
      
      reference1Name,
      reference1Phone,
      reference1Relation,
      
      reference2Name,
      reference2Phone,
      reference2Relation,
      
      declarationName,
      status: "PENDING"
    }
  });

  res.status(201).json({ status: "success", data: application });
});

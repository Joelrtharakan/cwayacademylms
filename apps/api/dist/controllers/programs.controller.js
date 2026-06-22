"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForProgram = exports.getProgram = exports.getPublicPrograms = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_service_1 = require("../services/storage.service");
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../services/email.service");
exports.getPublicPrograms = (0, errors_1.asyncHandler)(async (req, res) => {
    const programs = await prisma_1.prisma.program.findMany({
        where: { status: "PUBLISHED" },
        include: {
            courses: {
                where: { status: "PUBLISHED" },
                orderBy: { createdAt: "asc" },
                include: { _count: { select: { sections: true, enrollments: true } }, instructor: { select: { name: true } } }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: programs });
});
exports.getProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const program = await prisma_1.prisma.program.findUnique({
        where: { id },
        include: {
            courses: {
                where: { status: "PUBLISHED" },
                orderBy: { createdAt: "asc" },
                include: { _count: { select: { sections: true } } }
            }
        }
    });
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    res.json({ status: "success", data: program });
});
exports.applyForProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const program = await prisma_1.prisma.program.findUnique({ where: { id } });
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    const files = req.files;
    if (!files || !files["photo"] || files["photo"].length === 0) {
        throw new errors_1.AppError("Passport photo is required", 400);
    }
    // Upload photo
    const photoFile = files["photo"][0];
    const photoKey = (0, storage_service_1.generateKey)("applications/photos", `${Date.now()}-${photoFile.originalname}`);
    const { url: photoUrl } = await (0, storage_service_1.uploadToR2)(photoFile.buffer, photoKey, photoFile.mimetype);
    // Upload certificates
    const certificatesUrls = [];
    if (files["certificates"] && files["certificates"].length > 0) {
        for (const certFile of files["certificates"]) {
            const certKey = (0, storage_service_1.generateKey)("applications/certificates", `${Date.now()}-${certFile.originalname}`);
            const { url } = await (0, storage_service_1.uploadToR2)(certFile.buffer, certKey, certFile.mimetype);
            certificatesUrls.push(url);
        }
    }
    const { mediumOfStudy, fullName, dob, gender, maritalStatus, nationality, aadhaarNumber, mobileNumber, whatsappNumber, email, permanentAddressLine1, permanentAddressLine2, permanentCity, permanentState, permanentPostalCode, permanentCountry, currentAddressLine1, currentAddressLine2, currentCity, currentState, currentPostalCode, currentCountry, highestQualification, previousInstitution, yearOfCompletion, marksOrGrade, isBornAgain, churchName, churchAddressLine1, churchAddressLine2, churchCity, churchState, churchPostalCode, churchCountry, pastorName, ministryExperience, callingStatement, reference1Name, reference1Email, reference1Phone, reference1Relation, reference1Type, reference2Name, reference2Email, reference2Phone, reference2Relation, reference2Type, declarationName } = req.body;
    const reference1Token = crypto_1.default.randomBytes(32).toString("hex");
    const reference2Token = crypto_1.default.randomBytes(32).toString("hex");
    const application = await prisma_1.prisma.programApplication.create({
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
            reference1Email,
            reference1Phone,
            reference1Relation,
            reference1Type,
            reference1Token,
            reference2Name,
            reference2Email,
            reference2Phone,
            reference2Relation,
            reference2Type,
            reference2Token,
            declarationName,
            status: "PENDING"
        },
        include: {
            program: true
        }
    });
    // Send emails to references asynchronously
    if (reference1Email) {
        (0, email_service_1.sendReferenceFormEmail)({ name: reference1Name, email: reference1Email }, fullName, application.program.title, reference1Token).catch(err => console.error("Failed to send reference 1 email:", err));
    }
    if (reference2Email) {
        (0, email_service_1.sendReferenceFormEmail)({ name: reference2Name, email: reference2Email }, fullName, application.program.title, reference2Token).catch(err => console.error("Failed to send reference 2 email:", err));
    }
    res.status(201).json({ status: "success", data: application });
});

import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service";
import { prisma } from "../utils/prisma";
import { AppError, asyncHandler } from "../utils/errors";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid authorization token", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = TokenService.verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, isBanned: true },
  });

  if (!user) {
    throw new AppError("The user belonging to this token no longer exists", 401);
  }

  if (user.isBanned) {
    throw new AppError("Your account has been suspended", 403);
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  next();
});

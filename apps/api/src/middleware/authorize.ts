import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const authorize = (...roles: string[]) => {
  if (roles.includes("ADMIN") && !roles.includes("REGISTRAR")) {
    roles.push("REGISTRAR");
  }
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("User context not found in request", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    // Alias REGISTRAR to ADMIN for controller logic to pass hardcoded role checks
    if (req.user.role === "REGISTRAR") {
      req.user.role = "ADMIN";
    }

    next();
  };
};

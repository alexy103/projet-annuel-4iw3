import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../types";

const ANIMAL_UPLOAD_DIR = "uploads/animals";
const USER_UPLOAD_DIR = "uploads/users";

if (!fs.existsSync(ANIMAL_UPLOAD_DIR)) {
  fs.mkdirSync(ANIMAL_UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(USER_UPLOAD_DIR)) {
  fs.mkdirSync(USER_UPLOAD_DIR, { recursive: true });
}

const animalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ANIMAL_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const animalId = req.params.animalId ?? "unknown";
    cb(null, `${animalId}-${Date.now()}${ext}`);
  },
});

const userStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, USER_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.params.userId ?? "unknown";
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPEG, PNG and WebP images are allowed", 400) as unknown as null, false);
  }
};

export const uploadAnimalPicture = multer({
  storage: animalStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profile_picture");

export const uploadUserPicture = multer({
  storage: userStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profile_picture");

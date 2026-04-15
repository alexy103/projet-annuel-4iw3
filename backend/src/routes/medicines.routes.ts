import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createMedicine,
  deleteMedicine,
  getMedicineById,
  getMedicines,
  getMedicinesByBrand,
  getMedicinesByUserId,
  updateMedicine,
} from "../controllers";

export const medicinesRouter: Router = Router();

medicinesRouter.get("/", requireApiKey, requireAuth("admin", "user"), getMedicines);

medicinesRouter.get(
  "/search",
  requireApiKey,
  requireAuth("admin", "user"),
  getMedicinesByBrand,
);

medicinesRouter.get(
  "/user/:userId",
  requireApiKey,
  requireAuth("admin", "user"),
  getMedicinesByUserId,
);

medicinesRouter.get(
  "/:medicineId",
  requireApiKey,
  requireAuth("admin", "user"),
  getMedicineById,
);

medicinesRouter.post("/", requireApiKey, requireAuth("admin", "user"), createMedicine);

medicinesRouter.put(
  "/:medicineId",
  requireApiKey,
  requireAuth("admin", "user"),
  updateMedicine,
);

medicinesRouter.delete(
  "/:medicineId",
  requireApiKey,
  requireAuth("admin", "user"),
  deleteMedicine,
);

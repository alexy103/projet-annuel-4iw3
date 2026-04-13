import { Router } from "express";
import { requireApiKey, requireAuth } from "../middlewares";
import {
  createUsers2FA,
  deleteUsers2FA,
  getUsers2FA,
  getUsers2FAById,
  updateUsers2FA,
} from "../controllers";

export const users2FARouter: Router = Router();

users2FARouter.get("/", requireApiKey, requireAuth("admin"), getUsers2FA);

users2FARouter.get("/:id", requireApiKey, requireAuth("admin"), getUsers2FAById);

users2FARouter.post("/", requireApiKey, requireAuth(), createUsers2FA);

users2FARouter.put("/:id", requireApiKey, requireAuth(), updateUsers2FA);

users2FARouter.delete("/:id", requireApiKey, requireAuth("admin"), deleteUsers2FA);

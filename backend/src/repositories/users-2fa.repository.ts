import { Users2FA, CreateUsers2FAPayload, UpdateUsers2FAPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class Users2FARepository extends BaseRepository<Users2FA, CreateUsers2FAPayload, UpdateUsers2FAPayload> {
  constructor() {
    super("users_2fa", "Users2FA");
  }
}

export const users2FARepository = new Users2FARepository();


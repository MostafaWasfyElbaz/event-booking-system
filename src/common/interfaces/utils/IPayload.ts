import { UserRole } from "../../enums";

export interface IPayload {
  id: string;
  jti: string;
  role: UserRole;
  iat: number;
  exp: number;
}

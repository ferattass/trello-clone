import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateRoleSchema,
} from "../validators/team.validators.js";
import {
  createTeam,
  getMyTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveTeam,
} from "../controllers/team.controller.js";

const router = Router();

// Tum takim route'lari giris (token) ister
router.use(authenticate);

router.post("/", validate(createTeamSchema), createTeam);
router.get("/", getMyTeams);
router.get("/:id", getTeam);
router.put("/:id", validate(updateTeamSchema), updateTeam);
router.delete("/:id", deleteTeam);

// Uyelik islemleri
router.post("/:id/members", validate(inviteMemberSchema), inviteMember);
router.put("/:id/members/:userId/role", validate(updateRoleSchema), updateMemberRole);
router.delete("/:id/members/:userId", removeMember);
router.post("/:id/leave", leaveTeam);

export default router;

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireProjectMember } from "../utils/access.js";

// Projeye ait son 50 aktiviteyi, işlemi yapan kullanıcıyla birlikte döner.
export const getProjectActivity = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);

  // Kullanıcı projeye üye değilse erişim engellenir.
  await requireProjectMember(projectId, req.user.id);

  const activities = await prisma.activity.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({ activities });
});

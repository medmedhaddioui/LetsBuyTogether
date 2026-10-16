import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { groupRoutes } from "../modules/groups/group.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { promotionRoutes } from "../modules/promotions/promotion.routes.js";
import { reportRoutes } from "../modules/reports/report.routes.js";
import { reviewRoutes } from "../modules/reviews/review.routes.js";
import { storeRoutes } from "../modules/stores/store.routes.js";

import { userRoutes } from "../modules/users/user.routes.js";

export const apiRoutes = Router();
apiRoutes.get("/health", (_request, response) => {
  response.json({ success: true, data: { status: "ok" } });
});
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/promotions", promotionRoutes);
apiRoutes.use("/groups", groupRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/stores", storeRoutes);
apiRoutes.use("/notifications", notificationRoutes);
apiRoutes.use("/reports", reportRoutes);
apiRoutes.use("/reviews", reviewRoutes);
apiRoutes.use("/admin", adminRoutes);

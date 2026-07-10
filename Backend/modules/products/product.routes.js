import express from "express";
import { addProduct, getProducts } from "./product.controller.js";
import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Admin-only endpoints
router.post("/", adminMiddleware, addProduct);

// Any authenticated employee in the company can see the products to tag calls
router.get("/", getProducts);

export default router;

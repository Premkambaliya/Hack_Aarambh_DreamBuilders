import ProductService from "./product.service.js";

export const addProduct = async (req, res) => {
  try {
    const user = req.user; 
    const { productName, category, description } = req.body;

    if (!productName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const result = await ProductService.createProduct(user, { productName, category, description });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result
    });
  } catch (error) {
    console.error("Add product error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const user = req.user; 

    const products = await ProductService.getProductsByCompany(user.companyId);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

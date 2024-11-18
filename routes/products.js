const express = require("express");
const router = express.Router();
const { Product, validateProduct } = require("../models/product");

const { Category } = require("../models/category");
const { Cart, validateCart } = require("../models/Cart");

const upload = require("../config/multerConfig");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");


router.get("/",userIsLoggedIn, async (req, res) => {
  let somethingInCart = false;
  try {
    const resultArray = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          products: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          products: { $slice: ["$products", 10] },
        },
      },
    ]);
    console.log(resultArray);
    
  let cart = await Cart.findOne({user:req.session.passport.user});
    if(cart && cart.products.length > 0) somethingInCart = true;

    // Attempting to fetch 3 random products
   let rnproducts = await Product.aggregate([{ $sample: { size: 3 } }]);

    const resultObject = resultArray.reduce((acc, item) => {
      acc[item.category] = item.products;
      return acc;
    }, {});

    // Render with a fallback for `rnproducts` to ensure it’s an array
res.render("index",{products:resultObject,
  rnproducts,
  somethingInCart,
  cartCount: cart? cart.products.length : 0});
  } catch (err) {
    res.status(500).send("An error occurred while loading products");
    console.error("Error fetching products:", err);
  }
});


router.post("/", upload.single("image"), async function (req, res) {
  const { name, price, category, stock, description, image } = req.body;
  const { error } = validateProduct({ name, price, category, stock, description, image });
  if (error) {
    return res.status(500).send(error.message);
  }

  let isCategory = await Category.findOne({ name: category });
  if (!isCategory) {
    await Category.create({ name: category });
  }

  await Product.create({
    name,
    price,
    category,
    stock,
    description,
    image: req.file.buffer,
  });
  res.redirect("/admin/products");
});

router.get("/delete/:id", validateAdmin, async (req, res) => {
  if (req.user.admin) {
    await Product.findOneAndDelete({ _id: req.params.id });
    return res.redirect("/admin/products");
  }
  res.send("You are not allowed to delete this product.");
});

router.post("/delete", validateAdmin, async (req, res) => {
  if (req.user.admin) {
    await Product.findOneAndDelete({ _id: req.body.product_id });
    return res.redirect("back");
  }
  res.send("You are not allowed to delete this product.");
});

router.get("/update/:id", async function (req, res) {
  let product = await Product.findOne({ _id: req.params.id });
  if (!product) return res.status(404).send("Product not found");
  res.render("updateProduct", { product });
});

module.exports = router;

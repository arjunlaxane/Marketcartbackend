const express = require('express');
const Product = require('../models/productModel');
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require('../middleware/authentication');

const {
  createProduct,
  getAdminProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReview,
} = require('../controllers/productController');

const router = express.Router();

class ApiFeatures {
  constructor(query, querystr) {
    this.query = query;
    this.querystr = querystr;
  }

  search() {
    const keyword = this.querystr.keyword
      ? {
          name: {
            $regex: this.querystr.keyword,
            $options: 'i',
          },
        }
      : {};

    // console.log(keyword);
    //it is getting keyword from regex
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.querystr };
    // console.log(queryCopy);

    //Removing some fields for category

    const removeFields = ['keyword', 'page', 'limit'];

    removeFields.forEach(key => delete queryCopy[key]);
    // console.log(queryCopy);

    //filter for price and rating

    // console.log(queryCopy);

    //qurycopy is object

    let queryStr = JSON.stringify(queryCopy);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // console.log(queryStr);
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.querystr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

//get all product
router.get('/products', async (req, res) => {
  try {
    const resultPerPage = 8;

    // this productcount is for dashboard for frontend

    const productsCount = await Product.countDocuments();
    // console.log(req.query);
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();
    // console.log(apiFeature);
    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();
    // console.log(products);

    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);

router
  .route('/admin/products')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

router.route('/product/:id').get(getProductDetails);

router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);

router
  .route('/admin/product/:id')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

//reviews

//Create New Review or Update the review

router.route('/review').put(isAuthenticatedUser, createProductReview);

// // // Get All Reviews of a product

router.route('/review').get(isAuthenticatedUser, getAllReview);
module.exports = router;

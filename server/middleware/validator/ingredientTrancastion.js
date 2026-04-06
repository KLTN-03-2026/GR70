const { body, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");
// const cloudinary = require("../../config/connectCloudinary");
const ErrorMessageBase = require("../../utils/ErrorMessageBase");
const validateIngredient = [
  body("quantity").optional().isNumeric().withMessage(ErrorMessageBase.format(ErrorMessageBase.InvalidNumber, { PropertyName: "quantity" })),
  async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    //     if(req.file && req.file.publicId){
    //   await cloudinary.uploader.destroy(req.file.publicId)
    // }
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
      return next( ApiError.ValidationError(formattedErrors));
    }
    next();
  }
];

module.exports =  validateIngredient ;
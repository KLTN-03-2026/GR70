const { body, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");
// const cloudinary = require("../../config/connectCloudinary");
const ErrorMessageBase = require("../../utils/ErrorMessageBase");
const validateUser = [
  body("email").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "email"})).bail().isEmail().withMessage(ErrorMessageBase.InvalidEmail),
  body("password").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "password"})).bail().isLength({ min: 4, max: 30 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "password", MinLength: 4, MaxLength: 30})),
  body("name").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "name"})).bail().isLength({ min: 2, max: 50 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "name", MinLength: 2, MaxLength: 50})),
  body("nameBrand").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "nameBrand"})).bail().isLength({ min: 2, max: 50 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "nameBrand", MinLength: 2, MaxLength: 50})),
  body("addressBrand").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "addressBrand"})).bail().isLength({ min: 5, max: 100 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "addressBrand", MinLength: 5, MaxLength: 100})),
  body("address").notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "address"})).bail().isLength({ min: 5, max: 100 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "address", MinLength: 5, MaxLength: 100})),
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
    
      return next( ApiError.ValidationError("Validation failed"));
    //   return next( ApiError.ValidationError(formattedErrors));
    }
    next();
  }
];

module.exports =  validateUser ;
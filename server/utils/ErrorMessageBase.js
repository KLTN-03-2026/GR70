// utils/ErrorMessageBase.js
const ErrorMessageBase = {
    missingFields: "Missing required fields:", // "Thieu thong tin"
    NotEmpity: "{PropertyName} must not be empty", // không được để trống
    InvalidNumber: "{PropertyName} must be a valid number", // "{PropertyName} phải là một số hợp lệ"
    Incorrect: "{PropertyName} is incorrect", // "{PropertyName} khong dung"
    ActiveFalse: "{PropertyName} is inactive", // "{PropertyName} khong hoat dong"
    EXIST: "{PropertyName} is already in use",// "{PropertyName} da duoc su dung"

    Required: "{PropertyName} is required",
    InvalidEmail: "Invalid email format", // "Định dạng email không hợp lệ"
    InvalidPhoneNumber: "{PropertyName} is not a valid phone number", // "{PropertyName} không phải là số điện thoại hợp lệ"
    InvalidDate: "{PropertyName} is not a valid date (DD-MM-YYYY)", // "{PropertyName} không phải là ngày hợp lệ"

    MinLength: "{PropertyName} must be at least {MinLength} characters",  // "{PropertyName} phải có ít nhất {MinLength} ký tự"
    MaxLength: "{PropertyName} must not exceed {MaxLength} characters",  // "{PropertyName} không được vượt quá {MaxLength} ký tự"
    ExactLength: "{PropertyName} must be exactly {ExactLength} characters",  // "{PropertyName} phải có đúng {ExactLength} ký tự"

    GreaterThan: "{PropertyName} must be greater than {ComparisonValue}", // "{PropertyName} phải lớn hơn {ComparisonValue}"
    GreaterThanOrEqual: "{PropertyName} must be greater than or equal to {ComparisonValue}", // "{PropertyName} phải lớn hơn hoặc bằng {ComparisonValue}"
    LessThan: "{PropertyName} must be less than {ComparisonValue}",  // "{PropertyName} phải nhỏ hơn {ComparisonValue}"
    LessThanOrEqual: "{PropertyName} must be less than or equal to {ComparisonValue}", // "{PropertyName} phải nhỏ hơn hoặc bằng {ComparisonValue}"
    Range: "{PropertyName} must be between {MinLength} and {MaxLength} characters", // "{PropertyName} phải nằm trong khoảng {MinLength} đến {MaxLength} ký tự"

    OnlyLetters: "{PropertyName} can only contain letters", // "{PropertyName} chỉ được chứa chữ cái"
    OnlyNumbers: "{PropertyName} can only contain numbers",  // "{PropertyName} chỉ được chứa số"
    OnlyAlphanumeric: "{PropertyName} can only contain letters and numbers",   // "{PropertyName} chỉ được chứa chữ cái và số"
    InvalidFormat: "{PropertyName} has an invalid format", // "{PropertyName} có định dạng không hợp lệ"

    ListNotEmpty: "{PropertyName} must not be empty", // "{PropertyName} không được rỗng"
    ListMinItems: "{PropertyName} must contain at least {MinItems} items",  // "{PropertyName} phải chứa ít nhất {MinItems} phần tử"
    ListMaxItems: "{PropertyName} must contain no more than {MaxItems} items", // "{PropertyName} không được chứa nhiều hơn {MaxItems} phần tử"

    MustBeTrue: "{PropertyName} must be true", // "{PropertyName} phải là true"
    MustBeFalse: "{PropertyName} must be false", // "{PropertyName} phải là false"

    NotContainSpaces: "{PropertyName} must not contain spaces", // "{PropertyName} không được chứa khoảng trắng"

    MustMatch: "{PropertyName} must match {ComparisonProperty}",// "{PropertyName} phải trùng với {ComparisonProperty}"
    MustNotMatch: "{PropertyName} must not be the same as {ComparisonProperty}",    // "{PropertyName} không được trùng với {ComparisonProperty}"
    AlreadyExists: "{0} with value '{1}' already exists",  // "{0} với giá trị '{1}' đã tồn tại"

    NotFound: "with ID {0} was not found",  // "Không tìm thấy {0} với ID {1}"
    Forbidden: "You do not have the required permissions", // "Bạn không có quyền thực hiện hành động này"

    CreatedSuccess: "Created {0} successfully",
    UpdatedSuccess: "Updated {0} successfully",
    DeletedSuccess: "Deleted {0} successfully",

    CreateFailure: "Failed to create {0}",
    UpdateFailure: "Failed to update {0}",
    DeleteFailure: "Failed to delete {0}",

    Existed: "{0} already exists", // "{0}  đã tồn tại"

    // format(message, params = {}) {
    //     // Format object placeholders {PropertyName} & numbered placeholders {0}, {1}
    //     return message.replace(/\{(\w+)\}/g, (match, key) => {
    //         if (params.hasOwnProperty(key)) return params[key];
    //         return match; // giữ nguyên nếu không có key
    //     });
    // }
    format(message, ...params) {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
        // nếu key là số => lấy từ params[index]
        if (!isNaN(key)) {
            let index = parseInt(key, 10);
            if (index < params.length) return params[index];
        }
        // nếu key là chữ => lấy từ params[0][key]
        if (params.length > 0 && typeof params[0] === "object" && params[0].hasOwnProperty(key)) {
            return params[0][key];
        }
        return match;
    });
}
};

module.exports = ErrorMessageBase;

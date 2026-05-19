// utils/ErrorMessageBase.js
const ErrorMessageBase = {
    missingFields: "Thieu cac truong bat buoc:",
    NotEmpity: "{PropertyName} khong duoc de trong",
    InvalidNumber: "{PropertyName} phai la mot so hop le",
    Incorrect: "{PropertyName} khong dung",
    ActiveFalse: "{PropertyName} khong hoat dong",
    EXIST: "{PropertyName} da duoc su dung",

    Required: "{PropertyName} la bat buoc",
    InvalidEmail: "Dinh dang email khong hop le",
    InvalidPhoneNumber: "{PropertyName} khong phai la so dien thoai hop le",
    InvalidDate: "{PropertyName} khong phai la ngay hop le (DD-MM-YYYY)",

    MinLength: "{PropertyName} phai co it nhat {MinLength} ky tu",
    MaxLength: "{PropertyName} khong duoc vuot qua {MaxLength} ky tu",
    ExactLength: "{PropertyName} phai co dung {ExactLength} ky tu",

    GreaterThan: "{PropertyName} phai lon hon {ComparisonValue}",
    GreaterThanOrEqual: "{PropertyName} phai lon hon hoac bang {ComparisonValue}",
    LessThan: "{PropertyName} phai nho hon {ComparisonValue}",
    LessThanOrEqual: "{PropertyName} phai nho hon hoac bang {ComparisonValue}",
    Range: "{PropertyName} phai nam trong khoang {MinLength} den {MaxLength} ky tu",

    OnlyLetters: "{PropertyName} chi duoc chua chu cai",
    OnlyNumbers: "{PropertyName} chi duoc chua so",
    OnlyAlphanumeric: "{PropertyName} chi duoc chua chu cai va so",
    InvalidFormat: "{PropertyName} co dinh dang khong hop le",

    ListNotEmpty: "{PropertyName} khong duoc rong",
    ListMinItems: "{PropertyName} phai chua it nhat {MinItems} phan tu",
    ListMaxItems: "{PropertyName} khong duoc chua nhieu hon {MaxItems} phan tu",

    MustBeTrue: "{PropertyName} phai la true",
    MustBeFalse: "{PropertyName} phai la false",

    NotContainSpaces: "{PropertyName} khong duoc chua khoang trang",

    MustMatch: "{PropertyName} phai trung voi {ComparisonProperty}",
    MustNotMatch: "{PropertyName} khong duoc trung voi {ComparisonProperty}",
    AlreadyExists: "{0} voi gia tri '{1}' da ton tai",

    NotFound: "Khong tim thay du lieu voi ID {0}",
    Forbidden: "Ban khong co quyen thuc hien hanh dong nay",

    CreatedSuccess: "Tao {0} thanh cong",
    UpdatedSuccess: "Cap nhat {0} thanh cong",
    DeletedSuccess: "Xoa {0} thanh cong",

    CreateFailure: "Tao {0} that bai",
    UpdateFailure: "Cap nhat {0} that bai",
    DeleteFailure: "Xoa {0} that bai",

    Existed: "{0} da ton tai",

    format(message, ...params) {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
        if (!isNaN(key)) {
            let index = parseInt(key, 10);
            if (index < params.length) return params[index];
        }
        if (params.length > 0 && typeof params[0] === "object" && params[0].hasOwnProperty(key)) {
            return params[0][key];
        }
        return match;
    });
}
};

module.exports = ErrorMessageBase;

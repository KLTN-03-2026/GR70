// utils/ApiSuccess.js
class ApiSuccess {
    static response({ status = 200, title = "Success", message = "", data = null }) {
        return {
            success: true,
            title,
            status,
            message,
            data
        };
    }

    static created(entityName, data = null) {
        return ApiSuccess.response({
            status: 200,
            title: "Created",
            message: `${entityName} created successfully`,
            data
        });
    }

    static updated(entityName, data = null) {
        return ApiSuccess.response({
            status: 200,
            title: "Updated",
            message: `${entityName} updated successfully`,
            data
        });
    }

    static deleted(entityName) {
        return ApiSuccess.response({
            status: 200,
            title: "Deleted",
            message: `${entityName} deleted successfully`,
            data: null
        });
    }
    static getSelect(entityName, data = null) {
        return ApiSuccess.response({
            status: 200,
            title: "Get",
            message: `${entityName} get successfully`,
            data
        });
    }
    static updateStatus(entityName, data = null) {
        return ApiSuccess.response({
            status: 200,
            title: "Updated",
            message: `${entityName} successfully`,
            data
        });
    }
}

module.exports = ApiSuccess;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseUtil = void 0;
const common_1 = require("@nestjs/common");
class ApiResponseUtil {
    static success(data, message = 'Success', statusCode = common_1.HttpStatus.OK) {
        return {
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }
    static paginated(data, pagination, message = 'Success') {
        const totalPages = Math.ceil(pagination.total / pagination.limit);
        return {
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }
    static error(message, errorCode = 'UNKNOWN_ERROR', details, statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
        return {
            success: false,
            message,
            error: {
                code: errorCode,
                details
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }
    static badRequest(message, details) {
        return this.error(message, 'BAD_REQUEST', details, common_1.HttpStatus.BAD_REQUEST);
    }
    static notFound(message = 'Resource not found', details) {
        return this.error(message, 'NOT_FOUND', details, common_1.HttpStatus.NOT_FOUND);
    }
    static unauthorized(message = 'Unauthorized', details) {
        return this.error(message, 'UNAUTHORIZED', details, common_1.HttpStatus.UNAUTHORIZED);
    }
    static forbidden(message = 'Forbidden', details) {
        return this.error(message, 'FORBIDDEN', details, common_1.HttpStatus.FORBIDDEN);
    }
    static conflict(message = 'Conflict', details) {
        return this.error(message, 'CONFLICT', details, common_1.HttpStatus.CONFLICT);
    }
}
exports.ApiResponseUtil = ApiResponseUtil;

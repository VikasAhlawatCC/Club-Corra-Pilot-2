"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const file_entity_1 = require("./file.entity");
const files_service_1 = require("./files.service");
const files_controller_1 = require("./files.controller");
const s3_service_1 = require("../common/s3/s3.service");
let FileModule = class FileModule {
};
exports.FileModule = FileModule;
exports.FileModule = FileModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_entity_1.File])],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService, s3_service_1.S3Service],
        exports: [files_service_1.FilesService, s3_service_1.S3Service, typeorm_1.TypeOrmModule],
    })
], FileModule);

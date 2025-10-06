"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const brands_controller_1 = require("./brands.controller");
const brands_service_1 = require("../brands.service");
describe('BrandsController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [brands_controller_1.BrandsController],
            providers: [
                {
                    provide: brands_service_1.BrandsService,
                    useValue: {
                        findAll: jest.fn(),
                        findActiveBrands: jest.fn(),
                        findOne: jest.fn(),
                        findByCategory: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        createOffer: jest.fn(),
                        getOffersByBrand: jest.fn(),
                        updateOffer: jest.fn(),
                        removeOffer: jest.fn(),
                        createLocation: jest.fn(),
                        getLocationsByBrand: jest.fn(),
                        updateLocation: jest.fn(),
                        removeLocation: jest.fn(),
                    },
                },
            ],
        }).compile();
        controller = module.get(brands_controller_1.BrandsController);
        service = module.get(brands_service_1.BrandsService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('should list brands', async () => {
        const mockSearchDto = { page: 1, limit: 10 };
        const mockResponse = {
            brands: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };
        jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);
        const result = await controller.list(mockSearchDto);
        expect(service.findAll).toHaveBeenCalledWith(mockSearchDto);
        expect(result).toEqual(mockResponse);
    });
    it('should get active brands', async () => {
        const mockBrands = [
            {
                id: '1',
                name: 'Brand 1',
                description: 'Description 1',
                earningPercentage: 10,
                redemptionPercentage: 30,
                minRedemptionAmount: 1,
                maxRedemptionAmount: 2000,
                brandwiseMaxCap: 2000,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                locations: [],
                offers: [],
                transactions: []
            },
        ];
        jest.spyOn(service, 'findActiveBrands').mockResolvedValue(mockBrands);
        const result = await controller.active();
        expect(service.findActiveBrands).toHaveBeenCalled();
        expect(result).toEqual(mockBrands);
    });
    it('should get brand by id', async () => {
        const mockBrand = {
            id: '1',
            name: 'Brand 1',
            description: 'Description 1',
            earningPercentage: 10,
            redemptionPercentage: 30,
            minRedemptionAmount: 1,
            maxRedemptionAmount: 2000,
            brandwiseMaxCap: 2000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            locations: [],
            offers: [],
            transactions: []
        };
        jest.spyOn(service, 'findOne').mockResolvedValue(mockBrand);
        const result = await controller.get('1');
        expect(service.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockBrand);
    });
    it('should get brands by category', async () => {
        const mockBrands = [{
                id: '1',
                name: 'Brand 1',
                description: 'Description 1',
                earningPercentage: 10,
                redemptionPercentage: 30,
                minRedemptionAmount: 1,
                maxRedemptionAmount: 2000,
                brandwiseMaxCap: 2000,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                locations: [],
                offers: [],
                transactions: []
            }];
        jest.spyOn(service, 'findByCategory').mockResolvedValue(mockBrands);
        const result = await controller.byCategory('cat-1');
        expect(service.findByCategory).toHaveBeenCalledWith('cat-1');
        expect(result).toEqual(mockBrands);
    });
    it('should create brand', async () => {
        const createBrandDto = {
            name: 'New Brand',
            description: 'Brand description',
            categoryId: 'cat-1',
            earningPercentage: 5,
            redemptionPercentage: 10,
            brandwiseMaxCap: 1000,
        };
        const mockBrand = {
            id: '1',
            ...createBrandDto,
            minRedemptionAmount: createBrandDto.minRedemptionAmount || 1,
            maxRedemptionAmount: createBrandDto.maxRedemptionAmount || 2000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            locations: [],
            offers: [],
            transactions: []
        };
        jest.spyOn(service, 'create').mockResolvedValue(mockBrand);
        const result = await controller.create(createBrandDto);
        expect(service.create).toHaveBeenCalledWith(createBrandDto);
        expect(result).toEqual(mockBrand);
    });
    it('should update brand', async () => {
        const updateBrandDto = { name: 'Updated Brand' };
        const mockBrand = {
            id: '1',
            name: 'Updated Brand',
            description: 'Updated description',
            earningPercentage: 10,
            redemptionPercentage: 30,
            minRedemptionAmount: 1,
            maxRedemptionAmount: 2000,
            brandwiseMaxCap: 2000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            locations: [],
            offers: [],
            transactions: []
        };
        jest.spyOn(service, 'update').mockResolvedValue(mockBrand);
        const result = await controller.update('1', updateBrandDto);
        expect(service.update).toHaveBeenCalledWith('1', updateBrandDto);
        expect(result).toEqual(mockBrand);
    });
    it('should remove brand', async () => {
        jest.spyOn(service, 'remove').mockResolvedValue(undefined);
        const result = await controller.remove('1');
        expect(service.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual({ message: 'Brand deleted successfully' });
    });
});

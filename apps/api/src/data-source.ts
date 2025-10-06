import 'reflect-metadata'
import * as dotenv from 'dotenv'
dotenv.config()
import { DataSource } from 'typeorm'
import { typeOrmConfig } from './config/typeorm.config'

export const AppDataSource = new DataSource(typeOrmConfig)



import prisma from "../config/db"
import {beforeAll, afterAll} from "@jest/globals"

beforeAll(async () => {
    await prisma.$connect()
})

afterAll(async () => {
    await prisma.$disconnect()
})
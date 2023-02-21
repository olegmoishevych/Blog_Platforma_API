import {ObjectId} from "mongodb";
import bcrypt from "bcrypt";
import {usersRepository} from "../repositories/users-db-repository";
import {v4 as uuidv4} from 'uuid'
import add from 'date-fns/add'
import {emailService} from "./email-service";
import {DB_User_Type, UserType} from "../types";


export const usersService = {
    async getUser(sortBy: any, sortDirection: any, pageNumber: number, pageSize: number, searchLoginTerm: any, searchEmailTerm: any) {
        return usersRepository.getUser(sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm)
    },
    async checkUserCredentials(loginOrEmail: string, password: string) {
        const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const isPasswordsMatch = bcrypt.compare(password, user.passwordHash)
        if (!isPasswordsMatch) return null
        return user
    },
    async createUser(login: string, password: string, email: string): Promise<UserType | null> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generationHash(password, passwordSalt)

        const code = uuidv4()

        const newUser: DB_User_Type = {
            id: new ObjectId().toString(),
            _id: new ObjectId(),
            login,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: code,
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 3
                }),
                isConfirmed: false
            }
        }
        const result = await usersRepository.createUser(newUser)
        try {
            const bodyTextMessage = `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?code=${newUser.emailConfirmation.confirmationCode}'>complete registration</a>
      </p>`
            await emailService.sendEmail(email, "confirm code", bodyTextMessage)
        } catch (error) {
            console.log(error)
            return null
        }
        return result
    },
    async findUserByEmail(email: string): Promise<any> {
        return await usersRepository.findUserByEmail(email)
    },
    async findUserByLogin(login: string) {
        return await usersRepository.findUserByLoginOrEmail(login)
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },
    async confirmEmail(code: string, user: DB_User_Type) {
        if (user.emailConfirmation.expirationDate > new Date() && !user.emailConfirmation.isConfirmed) {
            const result = usersRepository.updateUserConfirmation(user.id)
            return result
        }
    },
    async findUserByCode(code: string): Promise<DB_User_Type | any> {
        return await usersRepository.findUserByCode(code)
    },
    async _generationHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt)
        return hash
    }
}
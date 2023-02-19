import {NextFunction, Request, Response} from "express";
import {jwtService} from "../application/jwt-service";
import {usersRepository} from "../repositories/users-db-repository";

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    // console.log('refreshToken', refreshToken)
    if (!refreshToken) return res.sendStatus(401)

    const userID = await jwtService.getUserIDByToken(refreshToken)
    // console.log('checkVerifyToken', userID)
    if (!userID) return res.sendStatus(401)

    const findUserById = await usersRepository.findUserByID(userID.userID)
    // console.log('findUserById', findUserById)
    if (!findUserById) return res.sendStatus(401)

    const findTokenInBlackList = await jwtService.findTokenInBlackList(refreshToken)
    // console.log('findTokenInBlackList', findTokenInBlackList)
    if (findTokenInBlackList) return res.sendStatus(401)

    req.user = findUserById
    next()
}
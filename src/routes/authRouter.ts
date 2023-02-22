import {Request, Response, Router} from "express";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwt-service";
import {authMiddleware} from "../middlewares/authMiddleware";
import {usersRepository} from "../repositories/users-db-repository";
import {email, login, newPassword, password} from "../validators/validators";
import {ExpressErrorValidator} from "../middlewares/expressErrorValidator";
import {queryRepository} from "../queryRepository/queryRepository";
import {refreshTokenMiddleware} from "../middlewares/refreshTokenMiddleware";
import {requestAttemptsMiddleware} from "../middlewares/requestAttemptsMiddleware";
import {authService} from "../domain/auth-service";
import {userSessionService} from "../domain/userSession-service";


export const authRouter = Router({})

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user?.id
    if (!user) return res.sendStatus(401)
    const userInfo = await usersRepository.findUserByID(user)
    res.status(200).send({
        email: userInfo?.email,
        login: userInfo?.login,
        userId: userInfo?.id
    })
})
authRouter.post('/login', requestAttemptsMiddleware, async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body
    const ip = req.ip
    const title = req.headers['user-agent'] || "browser not found"
    const token = await authService.login(loginOrEmail, password, ip, title)
    if (!token) return res.sendStatus(401)
    res.cookie('refreshToken', token.refreshToken, {httpOnly: false, secure: false})
    res.status(200).send({accessToken: token.accessToken})
})

authRouter.post('/refresh-token', refreshTokenMiddleware, async (req: Request, res: Response) => {
    const deviceId = req.deviceId!
    const user = req.user!
    const ip = req.ip
    const title = req.headers['user-agent'] || "browser not found"
    const newTokenPair = await authService.refreshToken(user, deviceId, ip, title)
    res.cookie('refreshToken', newTokenPair.refreshToken, {httpOnly: false, secure: false})
    res.status(200).send({accessToken: newTokenPair.accessToken})
})


authRouter.post('/registration', login, password, email, requestAttemptsMiddleware, ExpressErrorValidator, async (req: Request, res: Response) => {
    const {login, password, email} = req.body
    const findByLogin = await usersService.findUserByLogin(login)
    const findByEmail = await usersService.findUserByEmail(email)
    if (findByLogin?.login === login) return res.status(400).send({
        errorsMessages: [{message: login, field: "login"}]
    })
    if (findByEmail?.email === email) return res.status(400).send({
        errorsMessages: [{message: email, field: "email"}]
    })
    const user = await usersService.createUser(login, password, email)
    if (!user) return res.sendStatus(404)
    res.send(204)
})

authRouter.post('/registration-confirmation', requestAttemptsMiddleware, async (req: Request, res: Response) => {
    const code = req.body.code
    const error = {errorsMessages: [{message: code, field: "code"}]}
    const findUserByCode = await usersService.findUserByCode(code)
    if (!findUserByCode) return res.status(400).send(error)
    if (findUserByCode.emailConfirmation.isConfirmed) return res.status(400).send(error)
    await usersService.confirmEmail(code, findUserByCode)
    res.send(204)
})
authRouter.post('/registration-email-resending', requestAttemptsMiddleware, email, ExpressErrorValidator, async (req: Request, res: Response) => {
    const email = req.body.email
    const findUserByEmail = await usersService.findUserByEmail(email)
    if (!findUserByEmail || findUserByEmail.emailConfirmation.isConfirmed) return res.status(400).send({
        errorsMessages: [{
            message: email,
            field: "email"
        }]
    })
    await queryRepository.resendingEmail(email, findUserByEmail)
    return res.sendStatus(204)
})

authRouter.post('/logout', refreshTokenMiddleware, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken!
    const {userID, deviceId} = await jwtService.getJwtPayloadFromRefreshToken(refreshToken)
    const clearTokensPair = await jwtService.addRefreshTokenInBlackList(refreshToken)
    if (!clearTokensPair) return res.sendStatus(401)
    await userSessionService.deleteDeviceByDeviceID(userID, deviceId)
    res.sendStatus(204)
})

authRouter.post('/password-recovery', email, requestAttemptsMiddleware, ExpressErrorValidator, async (req: Request, res: Response) => {
    const email = req.body.email
    const findUserByEmailAndSendHimLetter = await usersService.findUserByEmailAndSendHimLetter(email)
    if (!findUserByEmailAndSendHimLetter) return res.sendStatus(404)
    res.sendStatus(204)
})

authRouter.post('/new-password', newPassword, requestAttemptsMiddleware, ExpressErrorValidator, async (req: Request, res: Response) => {
    const {newPassword, recoveryCode} = req.body
    const findUserRecoveryCodeAndChangeNewPassword = await usersService.findUserRecoveryCodeAndChangeNewPassword(newPassword, recoveryCode)
    if (!findUserRecoveryCodeAndChangeNewPassword) return res.sendStatus(400)
    res.sendStatus(204)
})
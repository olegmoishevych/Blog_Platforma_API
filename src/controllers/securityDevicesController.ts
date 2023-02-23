import {Request, Response} from "express";
import {jwtService} from "../application/jwt-service";
import {usersSessionRepository} from "../repositories/usersSession-db-repository";
import {userSessionService} from "../domain/userSession-service";

class SecurityDevicesController {
    async getDevices(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken
        const userId = await jwtService.getJwtPayloadFromRefreshToken(refreshToken)
        const getSessionsByUserID = await usersSessionRepository.getSessionByUserID(userId.userID)
        res.status(200).send(getSessionsByUserID)
    }
    async deleteDevices(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken
        const getDeviceDataByToken = await jwtService.getJwtPayloadFromRefreshToken(refreshToken)
        const {userId, deviceId} = getDeviceDataByToken
        await userSessionService.deleteAllDevice(userId, deviceId)
        res.sendStatus(204)
    }
    async deleteDeviceById(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken
        const deviceId = req.params.id

        const findDevicesByDeviceId = await userSessionService.findDevicesByDeviceId(deviceId)
        if (!findDevicesByDeviceId) return res.sendStatus(404)

        const findDeviceByUserId = await userSessionService.findDeviceByUserId(refreshToken)
        if (!findDeviceByUserId) return res.sendStatus(404)
        if (findDeviceByUserId.findDeviceByUserId?.userId !== findDeviceByUserId.userID) return res.sendStatus(403)

        const deletedSession = await userSessionService.deleteDeviceByDeviceID(findDeviceByUserId.userID, deviceId)
        if (!deletedSession) return res.sendStatus(403)
        res.sendStatus(204)
    }
}

export const securityDevicesController = new SecurityDevicesController()
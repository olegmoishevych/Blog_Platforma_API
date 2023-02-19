import {NextFunction, Request, Response} from "express";
import {attemptsRepository} from "../repositories/attempts-db-repository";

export const requestAttemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const timeLimit = new Date(new Date().getTime() - 1000) // date time
    const countOfAttempts = await attemptsRepository.countOfAttempts(req.ip, req.url, timeLimit)
    await attemptsRepository.addAttempts(req.ip, req.url, new Date())
    countOfAttempts < 5 ? next() : res.sendStatus(429)
}

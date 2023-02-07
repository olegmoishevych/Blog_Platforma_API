import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";


export const name = body('name').trim().isLength({min: 1, max: 15}).withMessage('name maxLength: 15')
export const description = body('description').trim().isLength({
    min: 1,
    max: 500
}).withMessage('description maxLength: 500')
export const websiteUrl = body('websiteUrl').trim().isLength({
    min: 1,
    max: 100
}).withMessage('description maxLength: 500')
export const title = body('title').trim().isLength({min: 1, max: 30}).withMessage('title maxLength: 30')
export const shortDescription = body('shortDescription').trim().isLength({
    min: 1,
    max: 100
}).withMessage('shortDescription maxLength: 30')
export const content = body('content').trim().isLength({min: 1, max: 1000}).withMessage('content maxLength: 1000')

export const postBlogValidator = [name, description, websiteUrl, inputValidationMiddleware]
export const postPostsValidator = [title, shortDescription, content, inputValidationMiddleware]
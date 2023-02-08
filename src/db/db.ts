import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv'
dotenv.config()

export type PostsType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    blogName: string
}

export type BlogsType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string
}

export const blogs = [] as BlogsType[]
export const posts = [] as PostsType[]


const mongoUri = process.env.mongoURI || process.env.MONGO_URL

if (!mongoUri) {
    throw new Error('URL didnt found')
}
const client = new MongoClient(mongoUri)
const db = client.db('bloggers')

export const blogsCollection = db.collection<BlogsType>('blogs')
export const postsCollection = db.collection<PostsType>('posts')


export const runDb = async () => {
    try {
        await client.connect()
        console.log('Connected successfully')
    } catch {
        console.log('! Not to connect to server')
        await client.close()
    }
}
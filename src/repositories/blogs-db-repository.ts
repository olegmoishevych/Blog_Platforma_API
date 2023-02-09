import {blogsCollection, BlogsType, DB_BlogsType} from "../db/db";
import {ObjectId} from "mongodb";

export const blogsRepository = {
    async getBlogs(): Promise<BlogsType[]> {
        return blogsCollection.find({}).toArray()
    },
    async createBlog(name: string, description: string, websiteUrl: string): Promise<DB_BlogsType | null> {
        const newBlog: BlogsType = {
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        const result = await blogsCollection.insertOne(newBlog)
        if (result.insertedId) {
            return {
                id: result.insertedId.toString(),
                name: newBlog.name,
                description: newBlog.description,
                websiteUrl: newBlog.websiteUrl,
                createdAt: newBlog.createdAt,
                isMembership: newBlog.isMembership
            }
        }
        return null
    },
    async getBlogById(id: string): Promise<BlogsType | null> {
        const blog: BlogsType | null = await blogsCollection.findOne({_id: new ObjectId(id)})
        console.log(blog)
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        const result = await blogsCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: name,
                description: description,
                websiteUrl: websiteUrl
            }
        })
        return result.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount === 1
    }
}
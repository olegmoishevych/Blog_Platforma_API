import {DB_PostsType, postsCollection, PostsType} from "../db/db";


export const postsRepository = {
    async getPosts(): Promise<PostsType[] | undefined> {
        return await postsCollection.find({}, {projection: {_id: 0}}).toArray()
    },
    async findBlogPost(pageNumber: number, pageSize: number, sortBy: any, sortDirection: any, blogId: string) {
        const findBlog = await postsCollection
            .find({blogId: blogId})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
        return findBlog
    },
    async createPost(newPost: PostsType): Promise<DB_PostsType | null> {
        const result = await postsCollection.insertOne(newPost)
        const {_id, ...postsCopy} = newPost
        return postsCopy
    },
    async createNewBlogPost(newBlogPost: PostsType): Promise<DB_PostsType | null> {
        const result = await postsCollection.insertOne(newBlogPost)
        const {_id, ...newBlogCopy} = newBlogPost
        return newBlogCopy
    },
    async getPostById(id: string): Promise<PostsType | null> {
        const post: PostsType | null = await postsCollection.findOne({id}, {projection: {_id: 0}})
        return post
    },
    async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        const result = await postsCollection.updateOne({id}, {
            $set: {
                title: title, shortDescription: shortDescription, content: content, blogId: blogId
            }
        })
        return result.matchedCount === 1
    },
    async deletePostById(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id})
        return result.deletedCount === 1
    }
}
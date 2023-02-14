import {CommentDBModalType, commentsCollection, CommentsType, DB_PostsType, postsCollection, PostsType} from "../db/db";
import {paginator} from "../helpers/pagination";


export const postsRepository = {
    async getPosts(pageNumber: number, pageSize: number, sortBy: any, sortDirection: any) {
        const findAndSortedPosts = await postsCollection
            .find({}, {projection: {_id: 0}})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        const getCountPosts = await postsCollection.countDocuments({})
        return paginator(pageNumber, pageSize, getCountPosts, findAndSortedPosts)
    },
    async createPostComment(newComment: CommentDBModalType): Promise<CommentsType> {
        const result = await commentsCollection.insertOne(newComment)
        const {_id, postId, ...comment} = newComment
        return comment
    },
    async findBlogPostByBlogID(pageNumber: number, pageSize: number, sortBy: any, sortDirection: any, blogId: string) {
        const findBlog = await postsCollection
            .find({blogId}, {projection: {_id: 0}})
            .sort({[sortBy]: sortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        const getCountPosts = await postsCollection.countDocuments({blogId})
        return paginator(pageNumber, pageSize, getCountPosts, findBlog)
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
        return await postsCollection.findOne({id}, {projection: {_id: 0}})
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
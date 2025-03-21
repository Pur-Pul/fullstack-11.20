const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('creator')
	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const id = request.params.id
	const blog = await (await Blog.findById(id).populate('creator')).populate('comments')
	response.json(blog)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
	try {
		const creator = request.user
		let blog = new Blog(request.body)


		blog.creator = creator.id

		let saved_blog = await blog.save()
		saved_blog = await (await saved_blog.populate('creator')).populate('comments')

		creator.blogs = creator.blogs.concat(saved_blog._id)
		await creator.save()
		response.status(201).json(saved_blog)
	} catch(exception) {
		next(exception)
	}
})

blogsRouter.post('/:id/comments', async (request, response, next) => {
	const id = request.params.id
	try {
		let comment = new Comment(request.body)
		let saved_comment = await comment.save()
		const blog = await Blog.findById(id)
		blog.comments = blog.comments.concat(saved_comment._id)
		await blog.save()
		await (await blog.populate('creator')).populate('comments')

		response.status(201).json(blog)

	} catch(exception) {
		next(exception)
	}
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
	const id = request.params.id
	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken.id) {
			return response.status(401).json({ error: 'token invalid' })
		}
		const user = await User.findById(decodedToken.id)
		const blog = await Blog.findById(id)

		if (blog.creator.toString() === user._id.toString()) {
			for (let i = 0; i < blog.comments.length; i++) {
				await Comment.findByIdAndDelete(blog.comments[i])
			}
			await Blog.findByIdAndDelete(id)
			const blog_index = user.blogs.findIndex((blog) => blog.toString === id.toString())
			user.blogs.splice(blog_index, 1)
			await user.save()
			response.status(204).end()
		} else {
			return response.status(403).json({ error: 'incorrect user' })
		}
	} catch(exception) {
		next(exception)
	}
})

blogsRouter.put('/:id', async (request, response, next) => {
	const id = request.params.id
	const blog = request.body
	try {
		const result = await Blog.findByIdAndUpdate(id, blog, { new: true, runValidators: true, context: 'query' }).populate('creator')
		response.status(201).json(result)
	} catch(exception) {
		next(exception)
	}
})
module.exports = blogsRouter
import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const blogSlice = createSlice({
	name: 'blog',
	initialState: [],
	reducers: {
		appendBlog(state, action) {
			state.push(action.payload)
		},
		setBlogs(state, action) {
			return action.payload
		},
		deleteBlog(state, action) {
			const blog_index = state.findIndex(
				(blog) => blog.id === action.payload
			)
			state.splice(blog_index, 1)
		},
		updateBlog(state, action) {
			const blog_index = state.findIndex(
				(blog) => blog.id === action.payload.id
			)
			state[blog_index] = action.payload
		},
		sortBlogs(state, action) {
			state.sort((blog1, blog2) => blog2.likes - blog1.likes)
		},
	},
})

export const { appendBlog, setBlogs, deleteBlog, updateBlog, sortBlogs } =
	blogSlice.actions

export const initializeBlogs = () => {
	return async (dispatch) => {
		let blogs = await blogService.getAll()
		dispatch(setBlogs(blogs))
		dispatch(sortBlogs())
	}
}

export const initializeComments = (id) => {
	return async (dispatch) => {
		let blog = await blogService.get(id)
		dispatch(updateBlog(blog))
	}
}

export const createBlog = (blog) => {
	return async (dispatch) => {
		const new_blog = await blogService.post(blog)
		console.log(new_blog)
		dispatch(appendBlog(new_blog))
	}
}

export const performRemove = (id) => {
	return async (dispatch) => {
		await blogService.remove(id)
		dispatch(deleteBlog(id))
	}
}

export const performLike = (id) => {
	return async (dispatch) => {
		let blog = await blogService.get(id)
		const response = await blogService.update({ likes: blog.likes + 1 }, id)
		dispatch(updateBlog(response))
		dispatch(sortBlogs())
	}
}

export const createComment = (comment, id) => {
	return async (dispatch) => {
		let blog = await blogService.post_comment(comment, id)
		dispatch(updateBlog(blog))
	}
}

export default blogSlice.reducer

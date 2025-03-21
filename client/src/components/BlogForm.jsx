import { useState, forwardRef, useImperativeHandle } from 'react'
import { createBlog } from '../reducers/blogReducer'
import { notificationSet } from '../reducers/notificationReducer.js'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

const BlogForm = forwardRef(() => {
	const [title, setTitle] = useState('')
	const [author, setAuthor] = useState('')
	const [url, setUrl] = useState('')
	const [formVisible, setFormVisible] = useState(false)
	const dispatch = useDispatch()

	const resetForm = () => {
		setTitle('')
		setAuthor('')
		setUrl('')
		setFormVisible(false)
	}

	const blogHandler = (event) => {
		event.preventDefault()
		dispatch(createBlog({ title, author, url }))
			.then(() => {
				resetForm()
				dispatch(
					notificationSet(
						{
							text: `a new blog ${title} by ${author} added`,
							type: 'message',
						},
						5
					)
				)
			})
			.catch((exception) => {
				console.log(exception)
				dispatch(
					notificationSet(
						{
							text: exception.response.data.error,
							type: 'error',
						},
						5
					)
				)
			})
	}

	const hideWhenVisible = { display: formVisible ? 'none' : '' }
	const showWhenVisible = { display: formVisible ? '' : 'none' }

	return (
		<div>
			<div style={hideWhenVisible}>
				<button onClick={() => setFormVisible(true)}>new blog</button>
			</div>
			<div style={showWhenVisible}>
				<h1>create new</h1>
				<form onSubmit={blogHandler}>
					<div>
						title
						<input
							type="text"
							value={title}
							name="title"
							onChange={({ target }) => setTitle(target.value)}
						/>
					</div>
					<div>
						author
						<input
							type="text"
							value={author}
							name="author"
							onChange={({ target }) => setAuthor(target.value)}
						/>
					</div>
					<div>
						url
						<input
							type="text"
							value={url}
							name="url"
							onChange={({ target }) => setUrl(target.value)}
						/>
					</div>
					<button type="submit">create</button>
				</form>
			</div>
		</div>
	)
})

BlogForm.displayName = 'BlogForm'

export default BlogForm

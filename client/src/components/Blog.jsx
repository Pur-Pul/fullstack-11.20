import {
	performRemove,
	performLike,
	initializeComments,
} from '../reducers/blogReducer'
import { notificationSet } from '../reducers/notificationReducer.js'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import CommentForm from './CommentForm.jsx'

const Blog = () => {
	const dispatch = useDispatch()
	const id = useParams().id
	useEffect(() => {
		dispatch(initializeComments(id))
	}, [dispatch, id])

	const blog = useSelector((state) => state.blogs).find(
		(blog) => blog.id === id
	)

	if (!blog) {
		return null
	}

	const loggedUserJSON = window.localStorage.getItem('loggedUser')
	let user
	if (loggedUserJSON) {
		user = JSON.parse(loggedUserJSON)
	}

	const likeHandler = (event) => {
		event.preventDefault()
		dispatch(performLike(blog.id))
			.then(() => {
				dispatch(
					notificationSet(
						{
							text: `Blog ${blog.title} liked.`,
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

	const removeHandler = (event) => {
		event.preventDefault()
		if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
			dispatch(performRemove(blog.id))
				.then(() => {
					dispatch(
						notificationSet(
							{
								text: `Blog ${blog.title} removed.`,
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
	}
	console.log(user.id)
	console.log(blog.creator)

	const showIfCreator = { display: user.id === blog.creator.id ? '' : 'none' }

	return (
		<div className="blog">
			<h2>{`${blog.title} by ${blog.author}`}</h2>
			<br />
			<a href={blog.url}>{blog.url}</a>
			<br />
			Likes: {blog.likes} <button onClick={likeHandler}>like</button>
			<br />
			{`Added by ${blog.creator.name}`}
			<br />
			<button style={showIfCreator} onClick={removeHandler}>
				remove
			</button>
			<br />
			<h3>comments</h3>
			<CommentForm id={blog.id} />
			<ul>
				{blog.comments.map((comment) => {
					if (comment.id === undefined) {
						return null
					} else {
						return <li key={comment.id}>{comment.text}</li>
					}
				})}
			</ul>
		</div>
	)
}

export default Blog

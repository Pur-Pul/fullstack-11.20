import { useState, forwardRef, useImperativeHandle } from 'react'
import { createComment } from '../reducers/blogReducer'
import { notificationSet } from '../reducers/notificationReducer.js'
import { useDispatch } from 'react-redux'

const CommentForm = ({ id }) => {
	const [text, setText] = useState('')
	const dispatch = useDispatch()

	const resetForm = () => {
		setText('')
	}

	const commentHandler = (event) => {
		event.preventDefault()
		dispatch(createComment({ text }, id))
			.then(() => {
				resetForm()
				dispatch(
					notificationSet(
						{
							text: 'a new comment created',
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

	return (
		<div>
			<div>
				<form onSubmit={commentHandler}>
					<input
						type="text"
						value={text}
						name="text"
						onChange={({ target }) => setText(target.value)}
					/>
					<button type="submit">add comment</button>
				</form>
			</div>
		</div>
	)
}

CommentForm.displayName = 'CommentForm'

export default CommentForm

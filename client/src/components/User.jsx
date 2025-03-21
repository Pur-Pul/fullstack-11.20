import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
const User = () => {
	const id = useParams().id
	const user = useSelector((state) => state.users).find(
		(user) => user.id === id
	)
	if (!user) {
		return null
	}

	return (
		<div>
			<h1>{user.name}</h1>
			<h2>added blogs</h2>
			<ul>
				{user.blogs.map((blog) => {
					return (
						<li key={blog.id}>
							<Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default User

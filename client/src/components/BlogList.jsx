import Blog from './Blog'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const BlogList = (props) => {
	const blogs = useSelector((state) => {
		return state.blogs
	})

	const blogStyle = {
		paddingTop: 10,
		paddingLeft: 2,
		border: 'solid',
		borderWidth: 1,
		marginBottom: 5,
	}

	return (
		<div className="blogs">
			<h1>blogs</h1>
			{blogs.map((blog) => (
				<div key={blog.id} style={blogStyle}>
					<Link to={`/blogs/${blog.id}`} className="blog">
						{`${blog.title} by ${blog.author}`}
					</Link>
				</div>
			))}
		</div>
	)
}

export default BlogList

import { useEffect } from 'react'
import BlogList from './components/BlogList'
import BlogForm from './components/BlogForm'
import LoginForm from './components/Login'
import { loginUser, performLogout } from './reducers/loginReducer'
import { initializeBlogs } from './reducers/blogReducer'
import './index.css'
import Notification from './components/Notification'
import { useDispatch, useSelector } from 'react-redux'
import { initializeUsers } from './reducers/userReducer'
import UserList from './components/UserList'
import User from './components/User'
import Blog from './components/Blog'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const App = () => {
	const user = useSelector((state) => {
		return state.login
	})
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(initializeBlogs())
	}, [dispatch])

	const blogs = useSelector((state) => state.blogs)

	useEffect(() => {
		dispatch(initializeUsers())
	}, [dispatch, blogs])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			dispatch(loginUser(user))
		}
	}, [dispatch])

	const logoutHandler = (event) => {
		event.preventDefault()
		dispatch(performLogout())
	}

	const padding = {
		paddingRight: 5,
		paddingLeft: 5,
	}

	const bar = {
		backgroundColor: 'lightGrey',
	}

	return (
		<Router>
			<Notification />
			{user === null ? (
				<LoginForm />
			) : (
				<div>
					<p style={bar}>
						<Link style={padding} to="/">
							Blogs
						</Link>
						<Link style={padding} to="/users">
							Users
						</Link>
						<span style={padding}>{user.name} logged-in</span>
						<button onClick={logoutHandler}>logout</button>
					</p>
					<Routes>
						<Route
							path="/"
							element={
								<div>
									<BlogForm />
									<BlogList />
								</div>
							}
						/>
						<Route path="/users" element={<UserList />} />
						<Route path="/users/:id" element={<User />} />
						<Route path="/blogs" element={<BlogList />} />
						<Route path="/blogs/:id" element={<Blog />} />
					</Routes>
				</div>
			)}
		</Router>
	)
}

export default App

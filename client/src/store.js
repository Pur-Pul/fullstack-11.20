import notificationReducer from './reducers/notificationReducer.js'
import blogReducer from './reducers/blogReducer'
import loginReducer from './reducers/loginReducer.js'
import userReducer from './reducers/userReducer.js'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
	reducer: {
		notification: notificationReducer,
		blogs: blogReducer,
		login: loginReducer,
		users: userReducer,
	},
})

export default store

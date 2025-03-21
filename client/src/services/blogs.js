import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const getAll = async () => {
	const response = await axios.get(baseUrl)
	return response.data
}

const get = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`)
	return response.data
}

const post = async (blog) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.post(baseUrl, blog, config)
	return response.data
}

const post_comment = async (comment, id) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.post(
		`${baseUrl}/${id}/comments`,
		comment,
		config
	)
	return response.data
}

const update = async (blog, id) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.put(`${baseUrl}/${id}`, blog, config)
	return response.data
}

const remove = async (id) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.delete(`${baseUrl}/${id}`, config)
	return response.data
}

const setToken = (new_token) => {
	token = `Bearer ${new_token}`
}

export default { get, getAll, post, post_comment, update, remove, setToken }

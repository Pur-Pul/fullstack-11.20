const lodash = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let sum = 0
	blogs.forEach((blog) => (sum += blog.likes))
	return sum
}

const favoriteBlog = (blogs) => {
	let best = null
	blogs.forEach((blog) => {
		if (best === null || best.likes < blog.likes) {
			best = blog
		}
	})
	return best
}

const mostBlogs = (blogs) => {
	const authors = lodash.countBy(blogs, (blog) => {
		return blog.author
	})

	if (Object.keys(authors).length === 0) {
		return null
	}
	const most_author = Object.keys(authors).reduce((a, b) =>
		authors[a] < authors[b] ? b : a
	)
	return {
		author: most_author,
		blogs: authors[most_author],
	}
}

const mostLikes = (blogs) => {
	if (blogs.length === 0) {
		return null
	}

	let authors = blogs.map(({ author }) => author)
	authors = lodash.uniq(authors)

	let author_likes = []
	authors.forEach((author) => {
		const likes = lodash.sumBy(
			lodash.filter(blogs, { author: author }),
			'likes'
		)
		author_likes.push({ author: author, likes: likes })
	})

	const most_liked_author = author_likes.reduce((a, b) =>
		a.likes < b.likes ? b : a
	)

	return most_liked_author
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
}

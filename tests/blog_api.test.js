const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

let initialUsers = [
    {
      	username: 'test1',
      	name: 'Test1 Person1',
      	passwordHash: null
    },
    {
      	username: 'test2',
      	name: 'Test2 Person2',
      	passwordHash: null
    }
]
const initialBlogs = [
    {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
    },
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    },
    {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0
    },
    {
        _id: '5a422b891b54a676234d17fa',
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10,
        __v: 0
    },
    {
        _id: '5a422ba71b54a676234d17fb',
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0,
        __v: 0
    },
    {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
    }
]
let token1 = undefined
let token2 = undefined

beforeEach(async () => {

    await User.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('sekret', 10)
        let userObject = new User(initialUsers[i])
        await userObject.save()
    }

    const users = await User.find({})
    await Blog.deleteMany({})
    for (let i = 0; i < initialBlogs.length; i++) {
        let blogObject = new Blog(initialBlogs[i])
        const creator = users[0]
        blogObject.creator = creator.id
        await blogObject.save()
    }

    const user1ForToken = {
        username: users[0].username,
        id: users[0].id,
    }
    const user2ForToken = {
        username: users[1].username,
        id: users[1].id,
    }
    token1 = jwt.sign(user1ForToken, process.env.SECRET)
    token2 = jwt.sign(user2ForToken, process.env.SECRET)
})

describe('blog get', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are six blogs', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, 6)
    })

    test('Blog contains \'id\'.', async () => {
        const response = await api.get('/api/blogs')
        assert('id' in response.body[0])
    })

    test('Blog does not contain \'_id\'.', async () => {
        const response = await api.get('/api/blogs')
        assert(!('_id' in response.body[0]))
    })

    test('Blog has a creator.', async () => {
        const response = await api.get('/api/blogs')
        assert('creator' in response.body[0])
    })

    test('Blog creator field is populated with a user.', async () => {
        const response = await api.get('/api/blogs')
        assert('username' in response.body[0].creator)
    })
})

describe('blog post', () => {
    test('New blog can be posted.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            ikes: 0,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)
        assert.strictEqual(response.body.length, initialBlogs.length + 1)
        assert(titles.includes('Test blog'))
    })

    test('Blog post request fails if token is missing.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            ikes: 0,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })

    test('Likes property of blog defaults to 0 if left empty.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const returned_blog = response.body.find(blog => {
            return blog.title === 'Test blog'
        })
        assert('likes' in returned_blog)
        assert.strictEqual(returned_blog.likes, 0)
    })

    test('Blog requires a title.', async () => {
        const newBlog = {
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(400)
    })

    test('Blog requires a url.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            likes: 0,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(400)
    })

    test('Created blog object contains a creator field', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0
        }
        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert('creator' in response.body)
    })

    test('Creator field is populated with a user.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0
        }
        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert('username' in response.body.creator)
    })

    test('Creator is the user identified by the token.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const returned_blog = response.body.find(blog => {
            return blog.title === 'Test blog'
        })
        const decodedToken = jwt.verify(token1, process.env.SECRET)
        const token_user = await User.findById(decodedToken.id)


        assert.strictEqual(returned_blog.creator.username, token_user.username)
    })

    test('User flagged as creator contains a new blog.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', 'Bearer ' + token1)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const returned_blog = response.body.find(blog => {
            return blog.title === 'Test blog'
        })
        const user = await User.findById(returned_blog.creator.id)
        assert.strictEqual(user.blogs.length, 1)
    })
})

describe('blog delete', () => {
    test('delete request deletes a blog.', async () => {
        await api
            .delete(`/api/blogs/${initialBlogs[0]._id}`)
            .set('Authorization', 'Bearer ' + token1)
            .expect(204)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, 5)
    })

    test('delete request deletes specified blog.', async () => {
        await api
            .delete(`/api/blogs/${initialBlogs[0]._id}`)
            .set('Authorization', 'Bearer ' + token1)
            .expect(204)

        const response = await api.get('/api/blogs')
        const ids = response.body.map(r => r.id)
        assert(!ids.includes(initialBlogs[0]._id))
    })

    test('delete request fails without token.', async () => {
        await api
            .delete(`/api/blogs/${initialBlogs[0]._id}`)
            .expect(401)
    })

    test('delete request fails with incorrect token.', async () => {
        await api
            .delete(`/api/blogs/${initialBlogs[0]._id}`)
            .set('Authorization', 'Bearer ' + token2)
            .expect(403)

    })
})

describe('blog update', async () => {
    test('updating a blog does not create a new blog.', async () => {
        const newBlog = {
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0,
        }
        await api
            .put(`/api/blogs/${initialBlogs[0]._id}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, 6)
    })

    test('updating a blog makes changes to an existing blog in the database.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 100,
        }
        await api
            .put(`/api/blogs/${initialBlogs[0]._id}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)
        const authors = response.body.map(r => r.author)
        const urls = response.body.map(r => r.url)
        const likes = response.body.map(r => r.likes)
        assert(titles.includes('Test blog'))
        assert(authors.includes('Test Person'))
        assert(urls.includes('https://google.com/'))
        assert(likes.includes(100))
    })

    test('the correct blog is updated.', async () => {
        const newBlog = {
            title: 'Test blog',
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 100,
        }
        await api
            .put(`/api/blogs/${initialBlogs[0]._id}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        const returned_blog = response.body.find(blog => {
            return blog.id === initialBlogs[0]._id
        })

        assert.strictEqual(returned_blog.title, newBlog.title)
        assert.strictEqual(returned_blog.author, newBlog.author)
        assert.strictEqual(returned_blog.url, newBlog.url)
        assert.strictEqual(returned_blog.likes, newBlog.likes)
    })

    test('Leaving a blog field empty does not update the field.', async () => {
        const newBlog = {}
        await api
            .put(`/api/blogs/${initialBlogs[0]._id}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        const returned_blog = response.body.find(blog => {
            return blog.id === initialBlogs[0]._id
        })

        assert.strictEqual(returned_blog.title, initialBlogs[0].title)
        assert.strictEqual(returned_blog.author, initialBlogs[0].author)
        assert.strictEqual(returned_blog.url, initialBlogs[0].url)
        assert.strictEqual(returned_blog.likes, initialBlogs[0].likes)
    })

    test('Updated blog creator field is populated by a user.', async () => {
        const newBlog = {
            author: 'Test Person',
            url: 'https://google.com/',
            likes: 0,
        }
        const response = await api
            .put(`/api/blogs/${initialBlogs[0]._id}`)
            .send(newBlog)
            .expect(201)

        assert('username' in response.body.creator)
    })
})
after(async () => {
  	await mongoose.connection.close()
})
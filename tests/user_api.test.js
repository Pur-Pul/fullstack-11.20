const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')

const api = supertest(app)
const User = require('../models/user')
const Blog = require('../models/blog')

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
beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('sekret', 10)
        let userObject = new User(initialUsers[i])
        await userObject.save()
    }
})

describe('user get', () => {
    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test(`there are ${initialUsers.length} users`, async () => {
        const response = await api.get('/api/users')
        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test('User contains \'id\'.', async () => {
        const response = await api.get('/api/users')
        assert('id' in response.body[0])
    })

    test('User does not contain \'_id\'.', async () => {
        const response = await api.get('/api/users')
        assert(!('_id' in response.body[0]))
    })

    test('User object does not contain \'password.\'', async () => {
        const response = await api.get('/api/users')
        assert(!('passwordHash' in response.body[0]))
    })

    test('User object contains blogs field.', async () => {
        const response = await api.get('/api/users')
        assert('blogs' in response.body[0])
    })

    test('User object is populated with blogs.', async () => {
        const creator = await User.findOne({})
        newBlog = new Blog({
            _id: '5a422a851b54a676234d17f7',
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 7,
            __v: 0
        })
        const saved_blog = await newBlog.save()
        creator.blogs = creator.blogs.concat(saved_blog._id)
        await creator.save()
        const response = await api.get('/api/users')

        const returned_creator = response.body.find(user => {
            return user.id === creator.id
        })

        assert.strictEqual(returned_creator.blogs[0].title, 'React patterns')
    })
})

describe('user post', () => {
    test('New user can be created.', async () => {
        let newUser = {
            username: 'newuser',
            name: 'new user',
            password: 'sekret'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        const titles = response.body.map(r => r.username)
        assert.strictEqual(response.body.length, initialUsers.length + 1)
        assert(titles.includes('newuser'))
    })

    test('username is required', async () => {
        let newUser = {
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username has to be atleast 3 characters long', async () => {
        let newUser = {
            username: 'ne',
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username has to be unique', async () => {
        let newUser = {
            username: 'test1',
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('password is required', async () => {
        let newUser = {
            username: 'newuser',
            name: 'new user'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('password has to be atleast 3 characters long', async () => {
        let newUser = {
            username: 'newuser',
            name: 'new user',
            password: 'se'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})

after(async () => {
    await mongoose.connection.close()
})
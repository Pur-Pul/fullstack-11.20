const {
	test,
	expect,
	beforeEach,
	describe,
	beforeAll,
} = require('@playwright/test')
const { loginWith, createNewBlog } = require('./helper')

describe('Blog app', () => {
	beforeEach(async ({ page, request }) => {
		await request.post('http://localhost:3003/api/testing/reset')
		await request.post('http://localhost:3003/api/users', {
			data: {
				name: 'Test User',
				username: 'test',
				password: 'pass',
			},
		})

		await page.goto('')
	})

	test('Login form is shown', async ({ page }) => {
		const locator = await page.getByText('login to application')
		await expect(locator).toBeVisible()
		const username_field = await page.locator('input[name="Username"]')
		await expect(username_field).toBeVisible()
		const password_field = await page.locator('input[name="Password"]')
		await expect(password_field).toBeVisible()
		const login_button = await page.getByRole('button', { name: 'login' })
		await expect(login_button).toBeVisible()
	})
	describe('Login', () => {
		test('succeeds with correct credentials', async ({ page }) => {
			await loginWith(page, 'test', 'pass')
			await expect(page.getByText('Test User logged-in')).toBeVisible()
		})

		test('fails with wrong credentials', async ({ page }) => {
			await loginWith(page, 'test', 'incorrect')
			await expect(
				page.getByText('Test User logged-in')
			).not.toBeVisible()
		})
	})
	describe('When logged in', () => {
		beforeEach(async ({ page }) => {
			await loginWith(page, 'test', 'pass')
		})

		test('new blog button is visible.', async ({ page }) => {
			const button = await page.getByRole('button', { name: 'new blog' })
			await expect(button).toBeVisible()
		})

		test('blog form is not visible by default.', async ({ page }) => {
			const locator = await page.getByText('create new')
			await expect(locator).not.toBeVisible()
			const title_field = await page.locator('input[name="title"]')
			await expect(title_field).not.toBeVisible()
			const author_field = await page.locator('input[name="author"]')
			await expect(author_field).not.toBeVisible()
			const url_field = await page.locator('input[name="url"]')
			await expect(url_field).not.toBeVisible()
			const create_button = await page.getByRole('button', {
				name: 'create',
			})
			await expect(create_button).not.toBeVisible()
		})

		test('blog form is visible after pressing the new blog button.', async ({
			page,
		}) => {
			await page.getByRole('button', { name: 'new blog' }).click()
			const locator = await page.getByText('create new')
			await expect(locator).toBeVisible()
			const title_field = await page.locator('input[name="title"]')
			await expect(title_field).toBeVisible()
			const author_field = await page.locator('input[name="author"]')
			await expect(author_field).toBeVisible()
			const url_field = await page.locator('input[name="url"]')
			await expect(url_field).toBeVisible()
			const create_button = await page.getByRole('button', {
				name: 'create',
			})
			await expect(create_button).toBeVisible()
		})

		test('div containing blogs is visible.', async ({ page }) => {
			const blogs_div = await page.locator('.blogs')
			await expect(blogs_div).toBeVisible()
		})

		test('new blog is visible in blog div after successful creation.', async ({
			page,
		}) => {
			await page.getByRole('button', { name: 'new blog' }).click()
			await createNewBlog(page, 'a new blog', 'new author', 'new url')
			const blog = await page.locator('.blog')

			await expect(blog).toBeVisible()
		})
		describe('After creating a new blog.', () => {
			let blog
			beforeEach(async ({ page }) => {
				await page.getByRole('button', { name: 'new blog' }).click()
				await createNewBlog(page, 'a new blog', 'new author', 'new url')
				blog = await page.locator('.blog')
			})
			//test('blog view button is visible.', async ({ page }) => {
			//    const blog_expand_button = await blog.getByRole('button', { name: 'view' })
			//    await expect(blog_expand_button).toBeVisible()
			//})
			test('url, likes and creator not visible by default.', async ({
				page,
			}) => {
				const blog_url = await blog.getByText('new url')
				const blog_likes = await blog.getByText(/Likes: 0/)
				const blog_user = await blog.getByText('Test User')
				await expect(blog_url).not.toBeVisible()
				await expect(blog_likes).not.toBeVisible()
				await expect(blog_user).not.toBeVisible()
			})

			describe('After clicking view', () => {
				beforeEach(async ({ page }) => {
					//await blog.getByRole('button', { name: 'view' }).click()
					await blog.click()
				})
				test('url, likes and creator visible after clicking view.', async ({
					page,
				}) => {
					const blog_url = await blog.getByText('new url')
					const blog_likes = await blog.getByText(/Likes: 0/)
					const blog_user = await blog.getByText('Test User')
					await expect(blog_url).toBeVisible()
					await expect(blog_likes).toBeVisible()
					await expect(blog_user).toBeVisible()
				})
				test('like button is visible.', async ({ page }) => {
					const remove_button = await blog.getByRole('button', {
						name: 'like',
					})
					await expect(remove_button).toBeVisible()
				})
				test('likes goes up by one after clicking like.', async ({
					page,
				}) => {
					const like_button = await blog.getByRole('button', {
						name: 'like',
					})
					await like_button.click()
					const blog_likes = await blog.getByText('Likes: ')
					await expect(blog_likes).toHaveText(/Likes: 1/)
				})
				test('remove button is visible.', async ({ page }) => {
					const remove_button = await blog.getByRole('button', {
						name: 'remove',
					})
					await expect(remove_button).toBeVisible()
				})
				test('clicking the remove button removes the blog from the blog div.', async ({
					page,
				}) => {
					const remove_button = await blog.getByRole('button', {
						name: 'remove',
					})
					page.on('dialog', (dialog) => dialog.accept())
					await remove_button.click()
					await expect(page.locator('.blog')).toHaveCount(0)
				})
			})

			describe('Logging in as another user.', () => {
				beforeEach(async ({ page, request }) => {
					await page.getByRole('button', { name: 'logout' }).click()
					await request.post('http://localhost:3003/api/users', {
						data: {
							name: 'Test2 User2',
							username: 'test2',
							password: 'pass',
						},
					})
					await page.locator('input[name="Username"]').fill('test2')
					await page.locator('input[name="Password"]').fill('pass')
					await page.getByRole('button', { name: 'login' }).click()
				})
				test('Other users don\'t see the remove button', async ({
					page,
				}) => {
					await page.locator('.blog').click()
					await expect(
						blog.getByRole('button', { name: 'remove' })
					).not.toBeVisible()
				})
			})
		})
	})
})

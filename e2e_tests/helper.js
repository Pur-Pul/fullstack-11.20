const loginWith = async (page, username, password)  => {
	await page.locator('input[name="Username"]').fill(username)
	await page.locator('input[name="Password"]').fill(password)
	await page.getByRole('button', { name: 'login' }).click()
}

const createNewBlog = async (page, title, author, url) => {
	await page.locator('input[name="title"]').fill(title)
	await page.locator('input[name="author"]').fill(author)
	await page.locator('input[name="url"]').fill(url)
	await page.getByRole('button', { name: 'create' }).click()
}

export { loginWith, createNewBlog }
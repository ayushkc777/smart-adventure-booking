import { execFile } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { expect, test } from '@playwright/test'

const execFileAsync = promisify(execFile)
const backendDir = path.resolve(process.cwd(), '../smart-adventure-api')
const screenshotsDir = path.resolve(process.cwd(), 'docs/testing/screenshots')
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)

test.describe.configure({ mode: 'serial' })

async function seedDatabase() {
  const env = { ...process.env }
  delete env.FORCE_COLOR
  delete env.NO_COLOR
  await execFileAsync('npm', ['run', 'seed'], {
    cwd: backendDir,
    env: { ...env, PORT: '5050' },
  })
}

async function login(page, email, password, expectedPath) {
  await page.goto('/login')
  await page.getByLabel('Email address', { exact: true }).fill(email)
  await page.getByLabel(/^password$/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(new RegExp(expectedPath))
}

async function logoutFromUserMenu(page) {
  await page.getByRole('button', { name: /open account menu/i }).click()
  await page.getByRole('menuitem', { name: /logout/i }).click()
  await expect(page).toHaveURL('/')
}

test.beforeAll(async () => {
  await mkdir(screenshotsDir, { recursive: true })
  await seedDatabase()
})

test.afterAll(async () => {
  await seedDatabase()
})

test('visitor can browse, plan, compare, contact support, and subscribe', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /compare and book nepal adventures/i })).toBeVisible()

  await page.getByLabel(/search activities/i).fill('Paragliding')
  await page.getByRole('button', { name: /^search$/i }).click()
  await expect(page).toHaveURL(/activities/)
  await expect(page.getByRole('heading', { name: /paragliding over fewa lake/i })).toBeVisible()

  await page.getByRole('button', { name: /add to comparison/i }).first().click()
  await expect(page.getByText(/added to comparison/i)).toBeVisible()
  await page.goto('/compare')
  await expect(page.getByRole('table')).toContainText('Paragliding over Fewa Lake')

  await page.goto('/#planner')
  await page.getByLabel(/activity preference/i).selectOption('Mountain Biking')
  await expect(
    page.locator('#planner').getByRole('heading', { name: /nagarkot mountain biking/i }),
  ).toBeVisible()

  await page.goto('/contact')
  await page.getByLabel(/full name/i).fill('E2E Visitor')
  await page.getByLabel(/^email$/i).fill('visitor-e2e@example.com')
  await page.getByLabel(/phone/i).fill('9800000000')
  await page.getByLabel(/subject/i).fill('Booking question')
  await page.getByLabel(/message/i).fill('Please help me compare operator availability for a trip.')
  await page.getByRole('button', { name: /send message/i }).click()
  await expect(page.getByText(/message received/i)).toBeVisible()

  await page.goto('/')
  await page.getByRole('main').getByLabel(/newsletter email address/i).fill(`newsletter-${Date.now()}@example.com`)
  await page.getByRole('main').getByRole('button', { name: /subscribe/i }).click()
  await expect(page.getByText(/thanks for joining/i)).toBeVisible()
  await page.screenshot({ fullPage: true, path: path.join(screenshotsDir, 'public-home.png') })

  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('/activities')
  await page.getByRole('button', { name: /show filters/i }).click()
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  )
  expect(hasHorizontalOverflow).toBe(false)
  await page.screenshot({ fullPage: true, path: path.join(screenshotsDir, 'mobile-activities.png') })
})

test('user can register, log in, save, book, view receipt, and update profile photo', async ({ page }) => {
  const email = `traveler-${Date.now()}@example.com`
  const password = 'Traveler123'

  await page.goto('/register')
  await page.getByLabel(/full name/i).fill('E2E Traveler')
  await page.getByLabel(/^email$/i).fill(email)
  await page.getByLabel(/phone/i).fill('9800000000')
  await page.getByLabel(/^password$/i).fill(password)
  await page.getByLabel(/confirm password/i).fill(password)
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page).toHaveURL(/user\/dashboard/)
  await expect(page.getByText(/welcome, e2e traveler/i)).toBeVisible()

  await logoutFromUserMenu(page)
  await login(page, email, password, 'user/dashboard')

  await page.goto('/activities')
  await page.getByRole('button', { name: /save activity/i }).first().click()
  await expect(page.getByText(/activity saved to your wishlist/i)).toBeVisible()

  await page.getByRole('link', { name: /book now/i }).first().click()
  await expect(page.getByRole('heading', { name: /book /i })).toBeVisible()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByLabel(/emergency contact name/i).fill('Backup Contact')
  await page.getByLabel(/emergency phone/i).fill('9811111111')
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByLabel(/photo and video package/i).check()
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByLabel(/safety advice is guidance only/i).check()
  await page.getByRole('button', { name: /confirm booking/i }).click()
  await expect(page).toHaveURL(/booking-success/)
  await expect(page.getByRole('heading', { name: /booking request received/i })).toBeVisible()
  await page.screenshot({ fullPage: true, path: path.join(screenshotsDir, 'booking-receipt.png') })

  await page.getByRole('link', { name: /view my bookings/i }).click()
  await expect(page.getByRole('heading', { name: /booking requests/i })).toBeVisible()
  await expect(page.getByText(/awaiting payment/i)).toBeVisible()

  await page.goto('/user/profile')
  await page.getByLabel(/nationality/i).fill('Nepali')
  await page.getByLabel(/emergency contact/i).fill('9811111111')
  await page.locator('input[type="file"]').setInputFiles({
    buffer: tinyPng,
    mimeType: 'image/png',
    name: 'avatar.png',
  })
  await page.getByRole('button', { name: /save profile/i }).click()
  await expect(page.getByRole('main').getByText(/profile updated successfully/i)).toBeVisible()
  await page.getByRole('button', { name: /remove photo/i }).click()
  await page.getByRole('button', { name: /save profile/i }).click()
  await expect(page.getByRole('main').getByText(/profile updated successfully/i)).toBeVisible()
})

test('admin can access console sections and live support/bookings data', async ({ page }) => {
  await login(page, 'admin@smartadventure.com', 'Admin123', 'admin')
  await expect(page.locator('header h1')).toHaveText('Dashboard')
  await page.screenshot({ fullPage: true, path: path.join(screenshotsDir, 'admin-dashboard.png') })

  const sections = [
    ['Users', 'Users'],
    ['Activities', 'Activities'],
    ['Operators', 'Operators'],
    ['Price Comparison', 'Price Comparison'],
    ['Bookings', 'Bookings'],
    ['Reviews', 'Reviews'],
    ['Support Messages', 'Support Messages'],
    ['Analytics', 'Analytics'],
    ['Settings', 'Settings'],
  ]

  for (const [linkName, headerText] of sections) {
    await page.getByRole('link', { name: linkName }).click()
    await expect(page.locator('header h1')).toHaveText(headerText)
  }

  await page.getByRole('link', { name: 'Bookings' }).click()
  const bookingRow = page.getByRole('row', { name: /E2E Traveler/i })
  await expect(bookingRow).toContainText(/Awaiting payment/i)
  await bookingRow.getByRole('button', { name: /^view$/i }).click()
  await expect(page.getByRole('heading', { name: /booking details/i })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('link', { name: 'Support Messages' }).click()
  await expect(page.getByText(/booking question/i)).toBeVisible()

  await page.locator('header').getByRole('button', { name: /logout/i }).click()
  await expect(page).toHaveURL('/')
})

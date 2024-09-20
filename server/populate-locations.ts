import { config } from 'dotenv'
import axios from 'axios'
import { MySQL } from './mysql.storage.ts'
import { DonationLocationDate } from '../src/types'


config()

if (!process.env.WP_API_URL || !process.env.WP_USERNAME || !process.env.WP_PASSWORD) {
  throw new Error('WP_API_URL, WP_USERNAME, or WP_PASSWORD environment variable is missing.')
}

const wp = axios.create({
  baseURL: process.env.WP_API_URL,
  auth: {
    username: process.env.WP_USERNAME,
    password: process.env.WP_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10_000,
  family: 4,
})

async function populateWpData() {


  await wp.get('/users', {
    params: {
      context: 'edit',
    },
  })
    .then(res => console.log('Succesfully accesed wp-json/wp/v2/users'))
    .catch(console.error)


  const db = await MySQL.getInstance().init()

  const data: DonationLocationDate[] = await db.getLocations()

  console.log(data.length + ' locations found in database')

  function decodeTitle(response: { data: [{ title: { rendered: string } }] }) {
    return response.data.map(item => decodeURIComponent(item.title.rendered))
  }


  const [wpLocationsTitles, wpSchedulesTitles,] = await Promise.all(
    [
      wp.get(`/locations`).then(decodeTitle),
      wp.get(`/schedule`).then(decodeTitle),
    ])

  console.log(wpLocationsTitles, wpSchedulesTitles)


  const requests = new Set()

  for (const item of data) {
    const { dateOpen, dateClose, donationLocation } = item
    const { name, schedulingUrl, address } = donationLocation
    const { city, street, number } = address

    if (!wpLocationsTitles.includes(name)) {
      requests.add(wp.post(`/locations`, {
        title: name,
        content: `Address: ${street}, ${number}, ${city}`,
        status: 'publish',
        acf: {
          city: city,
          street: street,
          number: number,
        },
      }).then(res => console.log(`Inserted locations for '${street}, ${number}, ${city}' into WordPress.`)))
    }

    if (!wpSchedulesTitles.some(title => title.includes(`Schedule for ${name}`))) {
      requests.add(wp.post(`/schedule`, {
        title: `Schedule for ${name}`,
        content: `Scheduling URL: ${schedulingUrl}`,
        status: 'publish',
        acf: {
          from: dateOpen,
          to: dateClose,
        },
      }).catch(console.error)
        .then(res => console.log(`Inserted schedule for '${name}' from ${dateOpen} to ${dateClose} into WordPress.`)))
    }
  }


  await Promise.allSettled(requests)
    .then(() => console.log('All requests finished'))

  await db.connection.end()
  console.log('Database connection closed')
  process.exit(0)
}


populateWpData()
  .catch(console.error)

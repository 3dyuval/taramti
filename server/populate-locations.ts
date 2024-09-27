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
  // function decodeTitle(response: { data: [{ title: { rendered: string } }] }) {
  //   return response.data.map(item => decodeURIComponent(item.title.rendered))
  // }


  await wp.get('/users', {
    params: {
      context: 'edit',
    },
  })
    .then(res => console.log('Succesfully accesed wp-json/wp/v2/users'))
    .catch(console.error)


  const db = await MySQL.getInstance().init()
  const data: DonationLocationDate[] = await db.getLocations()
  await db.connection.end()
  console.log(data.length + ' locations found in database')
  console.log('Database connection closed')


  const requests = new Set()

  for (const { dateOpen, dateClose, name, schedulingUrl, city, street, number }
    of data.slice(0)) {

    requests.add(wp.post(`/locations`, {
      title: name,
      content: `Address: ${street}, ${number}, ${city}`,
      status: 'publish',
      acf: {
        city,
        street,
        number,
      },
    }).then(res => console.log(`Inserted locations for '${street}, ${number}, ${city}' into WordPress.`)))

    requests.add(wp.post(`/schedule`, {
      title: `Schedule for ${name}`,
      content: `Blood donation date for ${name}`,
      status: 'publish',
      acf: {
        schedulingUrl,
        dateOpen,
        dateClose,
      },
    }).catch(console.error)
      .then(res => console.log(`Inserted schedule for '${name}' from ${dateOpen} to ${dateClose} into WordPress.`)))
  }


  await Promise.allSettled(requests)
    .then(() => console.log('All requests finished'))


  process.exit(0)
}


populateWpData()
  .catch(console.error)

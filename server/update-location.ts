import { config } from 'dotenv'
import axios from 'axios'

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
    Accept: 'application/json',
  },
  timeout: 10_000,
  family: 4,
})

async function updateLocation() {
  await wp
    .get('/users', {
      params: {
        context: 'edit',
      },
    })
    .then((res) => console.log('Succesfully accessed wp-json/wp/v2/users using BASIC auth'))
    .catch(console.error)


  // const options = await wp.options('/locations')
  // console.log(options.data)
  const response = await wp.post(`/locations/386`, {
      acf: {
        city: 'תל אביב יפו',
      }
  })

  console.log(response.data)
  process.exit(0)
}

updateLocation().catch(console.error)

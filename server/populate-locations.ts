import dotenv from 'dotenv'
import axios, { Axios } from 'axios'

dotenv.config()

if (!process.env.WP_API_URL || !process.env.WP_USERNAME || !process.env.WP_PASSWORD) {
  throw new Error('WP_API_URL, WP_USERNAME, or WP_PASSWORD environment variable is missing.')
}

const config = {
  baseURL: process.env.WP_API_URL,
  auth: {
    username: process.env.WP_USERNAME,
    password: process.env.WP_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  timeout: 10_000,
}

const wp = new Axios(config)

async function populateWpData() {

  await wp.options(`/locations`)
    .then(res => console.log(res.data))
    .catch(console.error)

  // await wp.get('/users', {
  //   params: {
  //     context: 'edit',
  //   },
  // })
  //   .then(res => console.log(res.data))
  //   .catch(console.error)


  return process.exit(0)

  //
  // // Initialize MySQL connection
  // const db = await MySQL.getInstance().init()
  //
  // // Fetch the data
  // const data: DonationLocationDate[] = await db.getLocations()
  //
  // console.log(data.length + ' locations found in database')
  //
  //
  // for (const item of data) {
  //   try {
  //     const { dateOpen, dateClose, donationLocation } = item
  //     const { name, schedulingUrl, address } = donationLocation
  //     const { city, street, number } = address
  //
  //     // Prepare data for WordPress Locations
  //     const postDataLocation = {
  //       title: name,
  //       content: `Address: ${street}, ${number}, ${city}`,
  //       status: 'publish',
  //       acf: {
  //         city: city,
  //         street: street,
  //         number: number,
  //       },
  //     }
  //
  //     // Prepare data for WordPress Schedules
  //     const postDataSchedule = {
  //       title: `Schedule for ${name}`,
  //       content: `Scheduling URL: ${schedulingUrl}`,
  //       status: 'publish',
  //       acf: {
  //         from: dateOpen,
  //         to: dateClose,
  //       },
  //     }
  //
  //     // Check if location already exists in WordPress
  //     const searchResponse = await axios.get(`${wpApiUrl}/wp-json/wp/v2/locations`, {
  //       params: {
  //         search: name,  // Adjust this based on your search implementation
  //       },
  //     }).then(res => console.log(res.data))
  //
  //
  //     const existingLocations = searchResponse.data
  //     let existingLocation = existingLocations.find((loc: any) =>
  //       loc.meta.acf_city === city &&
  //       loc.meta.acf_street === street &&
  //       loc.meta.acf_number === number,
  //     )
  //
  //     if (existingLocation) {
  //       console.log(`Location '${name}' already exists. Skipping.`)
  //       continue
  //     }
  //
  //     // Post to WordPress REST API for Locations
  //     await axios.post(`${wpApiUrl}/wp-json/wp/v2/locations`, postDataLocation, {
  //       headers: {
  //         'Authorization': `Basic ${auth}`,
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //
  //     console.log(`Inserted location '${name}' into WordPress.`)
  //
  //     // Post to WordPress REST API for Schedules
  //     await axios.post(`${wpApiUrl}/wp-json/wp/v2/schedules`, postDataSchedule, {
  //       headers: {
  //         'Authorization': `Basic ${auth}`,
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //
  //     console.log(`Inserted schedule for '${name}' into WordPress.`)
  //
  //   } catch (error) {
  //     console.error('Error processing data:', error.response ? error.response.data : error.message)
  //   }
  // }
  //
  //console.log('Data successfully inserted into WordPress!')
}

populateWpData().catch(console.error)

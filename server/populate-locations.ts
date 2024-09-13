import { DonationLocationDate } from '../src/types'
import { requestMadaData } from './madaRequest'
import dotenv from 'dotenv'
import axios from 'axios'
import { MySQL } from './mysql.storage'

dotenv.config()
import { DonationLocationDate } from '../src/types'
import { requestMadaData } from './madaRequest'
import dotenv from 'dotenv'
import axios from 'axios'
import { MySQL } from './mysql.storage'

dotenv.config()

async function populateWpData() {
  const wpApiUrl = process.env.WP_API_URL
  const wpUsername = process.env.WP_USERNAME
  const wpPassword = process.env.WP_PASSWORD

  if (!wpApiUrl || !wpUsername || !wpPassword) {
    throw new Error('WP_API_URL, WP_USERNAME, or WP_PASSWORD environment variable is missing.')
  }

  // Basic Authentication
  const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

  // Initialize MySQL connection
  const db = await MySQL.getInstance().init()

  // Fetch the data
  const data: DonationLocationDate[] = await db.getLocations()

  for (const item of data) {
    try {
      const { dateOpen, dateClose, donationLocation } = item
      const { name, schedulingUrl, address } = donationLocation
      const { city, street, number } = address

      // Prepare data for WordPress Locations
      const postDataLocation = {
        title: name,
        content: `Address: ${street}, ${number}, ${city}`,
        status: 'publish',
        acf: {
          city: city,
          street: street,
          number: number
        }
      }

      // Prepare data for WordPress Schedules
      const postDataSchedule = {
        title: `Schedule for ${name}`,
        content: `Scheduling URL: ${schedulingUrl}`,
        status: 'publish',
        acf: {
          from: dateOpen,
          to: dateClose
        }
      }

      // Check if location already exists in WordPress
      const searchResponse = await axios.get(`${wpApiUrl}/wp-json/wp/v2/locations`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        params: {
          search: name  // Adjust this based on your search implementation
        }
      })

      const existingLocations = searchResponse.data
      let existingLocation = existingLocations.find((loc: any) =>
        loc.meta.acf_city === city &&
        loc.meta.acf_street === street &&
        loc.meta.acf_number === number
      )

      if (existingLocation) {
        console.log(`Location '${name}' already exists. Skipping.`)
        continue
      }

      // Post to WordPress REST API for Locations
      await axios.post(`${wpApiUrl}/wp-json/wp/v2/locations`, postDataLocation, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`Inserted location '${name}' into WordPress.`)

      // Post to WordPress REST API for Schedules
      await axios.post(`${wpApiUrl}/wp-json/wp/v2/schedules`, postDataSchedule, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`Inserted schedule for '${name}' into WordPress.`)

    } catch (error) {
      console.error('Error processing data:', error.response ? error.response.data : error.message)
    }
  }

  console.log('Data successfully inserted into WordPress!')
}

populateWpData().catch(console.error)

import { DonationLocationDate } from '../src/types'
import { DonationLocationDate, requestMadaData } from './madaRequest'
import dotenv from 'dotenv'
import { MySQL } from './mysql.storage'


dotenv.config()

async function populateWpData() {

  const db = await MySQL.getInstance().init()

  // Fetch the data
  const data: DonationLocationDate[] = await requestMadaData()

  // Loop over the data and insert it into the MySQL database
  for (const item of data) {
    try {
      const { dateOpen, dateClose, donationLocation } = item
      const { name, schedulingUrl, address } = donationLocation
      const { city, street, number } = address

      // Insert into Address table
      const [addressResult] = await db.connection.execute(
        'INSERT INTO Address (city, street, number) VALUES (?, ?, ?)',
        [city, street, number],
      )
      const addressId = addressResult.insertId

      // Insert into DonationLocation table
      const [donationLocationResult] = await db.connection.execute(
        'INSERT INTO DonationLocation (name, schedulingUrl, addressId) VALUES (?, ?, ?)',
        [name, schedulingUrl, addressId],
      )
      const donationLocationId = donationLocationResult.insertId

      // Insert into DonationLocationDate table
      await connection.execute(
        'INSERT INTO DonationLocationDate (dateOpen, dateClose, donationLocationId) VALUES (?, ?, ?)',
        [dateOpen, dateClose, donationLocationId],
      )

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.warn('Duplicate entry detected:', error.sqlMessage)
      } else {
        console.error('Error inserting data:', error)
      }
    }

  }

  console.log('Data successfully inserted!')
  await connection.end()
}

insertData().catch(console.error)
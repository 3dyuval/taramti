import { DonationLocationDate } from '../src/types'
import mysql from 'mysql2/promise';
import { requestMadaData, DonationLocationDate } from './madaRequest';
import dotenv from 'dotenv';
dotenv.config();

async function insertData() {

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    // password: process.env.MYSQL_PASSWORD,
  });

  // Fetch the data
  const data: DonationLocationDate[] = await requestMadaData();

  // Loop over the data and insert it into the MySQL database
  for (const item of data) {
    const { dateOpen, dateClose, donationLocation } = item;
    const { name, schedulingUrl, address } = donationLocation;
    const { city, street, number } = address;

    // Insert into Address table
    const [addressResult] = await connection.execute(
      'INSERT INTO Address (city, street, number) VALUES (?, ?, ?)',
      [city, street, number]
    );
    const addressId = addressResult.insertId;

    // Insert into DonationLocation table
    const [donationLocationResult] = await connection.execute(
      'INSERT INTO DonationLocation (name, schedulingUrl, addressId) VALUES (?, ?, ?)',
      [name, schedulingUrl, addressId]
    );
    const donationLocationId = donationLocationResult.insertId;

    // Insert into DonationLocationDate table
    await connection.execute(
      'INSERT INTO DonationLocationDate (dateOpen, dateClose, donationLocationId) VALUES (?, ?, ?)',
      [dateOpen, dateClose, donationLocationId]
    );
  }

  console.log('Data successfully inserted!');
  await connection.end();
}

insertData().catch(console.error);
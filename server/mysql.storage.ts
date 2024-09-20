import mysql from 'mysql2/promise'
import { DonationLocationDate } from '../src/types'
import { IStorage } from './storage'
import dotenv from 'dotenv'


dotenv.config()


export class MySQL implements IStorage {
  private static instance: MySQL
  private connection: mysql.Pool | null = null

  // Private constructor to prevent direct instantiation
  private constructor() {
  }

  // Static method to get the singleton instance
  public static getInstance(): MySQL {
    if (!MySQL.instance) {
      MySQL.instance = new MySQL()
    }
    return MySQL.instance
  }

  // Async initialization method
  async init(): Promise<this> {
    if (this.connection) {
      // Connection already initialized
      return this
    }

    // Create a connection pool
    this.connection = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      // password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    // Optionally test the connection
    try {
      await this.connection.query('SELECT 1')
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Error connecting to the database:', error)
      throw error
    }

    return this
  }

  // Retrieve locations within a date range
  async getLocations(dateFrom?: string, dateTo?: string): Promise<DonationLocationDate[]> {
    if (!this.connection) {
      throw new Error('Database not initialized')
    }

    let query = `
      SELECT
        dld.id AS donationLocationDateId,
        dld.dateOpen,
        dld.dateClose,
        dl.id AS donationLocationId,
        dl.name AS donationLocationName,
        dl.schedulingUrl AS donationLocationSchedulingUrl,
        a.id AS addressId,
        a.city AS addressCity,
        a.street AS addressStreet,
        a.number AS addressNumber
      FROM
        DonationLocationDate dld
      JOIN
        DonationLocation dl ON dld.donationLocationId = dl.id
      JOIN
        Address a ON dl.addressId = a.id
    `

    const params: any[] = []
    if (dateFrom && dateTo) {
      query += ' WHERE dld.dateOpen >= ? AND dld.dateClose <= ?'
      params.push(dateFrom, dateTo)
    }

    const [rows] = await this.connection.query(query, params)

    // Convert rows to DonationLocationDate[]
    return rows.map((row: any) => ({
      dateOpen: row.dateOpen,
      dateClose: row.dateClose,
      name: row.donationLocationName,
      schedulingUrl: row.donationLocationSchedulingUrl,
      city: row.addressCity,
      street: row.addressStreet,
      number: row.addressNumber,
    }))
  }

  // Retrieve a location by name
  async getLocationByName(name: string): Promise<DonationLocationDate> {
    if (!this.connection) {
      throw new Error('Database not initialized')
    }

    const query = `
      SELECT
        dld.id AS donationLocationDateId,
        dld.dateOpen,
        dld.dateClose,
        dl.id AS donationLocationId,
        dl.name AS donationLocationName,
        dl.schedulingUrl AS donationLocationSchedulingUrl,
        a.id AS addressId,
        a.city AS addressCity,
        a.street AS addressStreet,
        a.number AS addressNumber
      FROM
        DonationLocationDate dld
      JOIN
        DonationLocation dl ON dld.donationLocationId = dl.id
      JOIN
        Address a ON dl.addressId = a.id
      WHERE
        dl.name = ?
    `

    const [rows] = await this.connection.query(query, [name])

    if (rows.length === 0) {
      throw new Error('Location not found')
    }

    const row = rows[0]

    // Convert row to DonationLocationDate
    return {
      dateOpen: row.dateOpen,
      dateClose: row.dateClose,
      name: row.donationLocationName,
      schedulingUrl: row.donationLocationSchedulingUrl,
      city: row.addressCity,
      street: row.addressStreet,
      number: row.addressNumber,
    }
  }
}

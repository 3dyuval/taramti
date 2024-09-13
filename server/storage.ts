import { DonationLocationDate, IStorage } from '@/types.js'
import { requestMadaData } from './madaRequest.js'
import { LRUCache } from 'lru-cache'
import { isAfter, isBefore } from 'date-fns'

export class DB implements IStorage {
  private cache

  constructor() {
    this.cache = new LRUCache({ max: 10000, ttl: 1000 * 60 * 60 * 24 })
    return this
  }

  async getLocations(dateFrom?: string, dateTo?: string) {
    // from and to parsed from url params

    let items: DonationLocationDate[] = this.cache.get('all') as DonationLocationDate[]
    if (!items) {
      items = await requestMadaData()
      this.cache.set('all', items)
    }

    return items.filter(({ dateOpen }) =>
      !dateFrom || isAfter(dateOpen, new Date(dateFrom))
    ).filter(({ dateClose }) =>
      !dateTo || isBefore(dateClose, new Date(dateTo))
    )
  }

  async getLocationByName(name: string): Promise<DonationLocationDate> {

    // TODO, return DonationLocationDate[]

    const items = await this.getLocations()
    return items.find(item => item.donationLocation.name.toLowerCase().includes(name.toLowerCase()))
      || Promise.reject(`No location with name ${name} was found`)
  }

}
import type {
  PageContextBuiltInClientWithServerRouting as PageContextBuiltInClient,
  PageContextBuiltInServer,
} from 'vike/types'
import type { ComponentPublicInstance } from 'vue'


export type Coords = {
  lat: string;
  lng: string
}

export interface IStorage {
  init: () => Promise<this>;
  getLocations: (dateFrom?: string, dateTo?: string) => Promise<DonationLocationDate[]>;
  getLocationByName: (name: string) => Promise<DonationLocationDate>;
}


export type DonationLocationDate = {
  dateOpen: number
  dateClose: number
  name: string;
  schedulingUrl: string;
  city: string | null;
  street: string | null;
  number: string | null;
}


export type { PageContextServer }
export type { PageContextClient }
export type { PageContext }
export type { PageProps }
export type { Component }

type Component = ComponentPublicInstance // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086
type Page = Component
type PageProps = {
  locations: DonationLocationDate[],
  location?: DonationLocationDate,
  coords?: Coords,
  error?: string
}

export type PageContextCustom = {
  locale: string
  refererUrl?: string
  Page: Page
  pageProps?: PageProps
  db: IStorage
  urlPathname: string
  routeParams: {
    location?: string
  },
  exports: {
    getDocumentProps?: (pageProps: PageProps) => {
      title?: string;
      description: string
    };
    documentProps?: {
      title?: string
      description?: string
    }
  }
}

type PageContextServer = PageContextBuiltInServer<Page> & PageContextCustom
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom

type PageContext = PageContextClient | PageContextServer
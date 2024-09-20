<script setup lang='ts'>
import type { Coords, DonationLocationDate } from '@/types'
import { ref } from 'vue'
import Map from '@/components/Map.vue'
import OpeningHoursTimeline from '@/components/OpeningHoursTimeline.vue'
import OpeningHoursChip from '@/components/OpeningHoursChip.vue'
import { usePageContext } from '@/composables/usePageContext'
import { getAddress } from '@/helpers/getAddress'
import { useShare } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  locations: DonationLocationDate[]
  location: DonationLocationDate
  coords: Coords
  error?: string
}>()

const { t } = useI18n()

const center = ref<Coords>(props.coords)

const address = getAddress(props.location)

const pageContext = usePageContext()

const expanded = ref(false)
const drawer = ref(false)

const { share } = useShare({
  title: 'Taramti',
  text: 'Taramti',
  url: pageContext.urlPathname
})


</script>

<template>
  <Map :center='center' :error='error'>
    <div
      class='d-flex flex-column location-window px-6 justify-center'
      :class='{ expanded }'
    >
      <v-card elevation='0'>
        <template #title>
          <div class='d-flex flex-row justify-space-between flex-wrap'>
            <h3 class='mb-4'>{{ location.name }}</h3>
            <opening-hours-chip
              :from-hour='location.dateOpen'
              :to-hour='location.dateClose'
            />
          </div>
        </template>
        <template #subtitle>
          <span class='d-flex py-2'>
            <v-icon icon='map-pin-line'
                    :size='20'
                    weight='fill'
                    color='gray'
                    class='mx-2'
            />
            <address>{{ address }}</address>
          </span>
        </template>
        <template #default>
          <v-divider />
        </template>
        <template #actions>
          <v-card-actions>
            <v-btn
              variant='tonal'
              color='secondary'
              size='large'
              :text="t('donationLocation.openingHours')"
              @click='expanded = !expanded'
              class='my-2 flex-grow-1'
            />
            <!--          TODO  <v-btn-->
            <!--              variant="outlined"-->
            <!--              icon="mdi-heart"-->
            <!--              :color="'#f2f2f2'"-->
            <!--            ></v-btn>-->
            <v-btn
              variant='plain'
              class='my-2'
              @click='share()'
              v-t="'common.share'"
              size='large'
              icon='share'
            />
          </v-card-actions>
        </template>
      </v-card>
      <div class='details-card-expand'>
        <v-card
          @click='drawer = !drawer'
          :subtitle='location.donationLocation.name'
          class='details-card px-12'
          elevation='0'
        >
          <v-card-title v-t="'donationLocation.openingHours'" />
          <template #actions>
            <v-card-actions>
              <v-btn
                color='default'
                @click.prevent
                v-ripple='false'
                variant='outlined'
                :text="t('common.moreActions')"
              />
            </v-card-actions>
          </template>
          <opening-hours-timeline :row='location' />
          <v-alert icon='ph-heart'
                   :title="t('location.time.disclaimer.title')"
                   :text="t('location.time.disclaimer.text')"
          />
        </v-card>
      </div>
    </div>
    <v-navigation-drawer
      density='compfortable'
      v-model='drawer'
      location='bottom'
      temporary
    >
      <v-list-item
        variant='text'
        color='primary'
        :href='props.location.donationLocation.schedulingUrl'
        target='_blank'
        :title="t('location.schedule')"
        append-icon='hand-pointing'
      >
        <v-list-item-title :text='t("location.schedule")' />
        <v-tooltip
          activator='parent'
          :text='t("location.scheduleDescription")'
          location='top center'
        />
      </v-list-item>
      <v-list-item
        variant='text'
        color='primary'
        :href='`http://www.google.com/maps/place/${props.coords.lat},${props.coords.lng}`'
        target='_blank'
        :title="t('location.navigate')"
        append-icon='map-trifold'
      >
        <v-tooltip
          activator='parent'
          :text="t('location.navigateDescription')"
          location='top center'
        />
      </v-list-item>
      <v-list-item
        variant='text'
        color='primary'
        @click='share()'
        :title="t('common.share')"
        append-icon='share'
      >
        <v-tooltip activator='parent'
                   :text='t("common.shareDescription")'
                   location='top center' />
      </v-list-item>
    </v-navigation-drawer>
  </Map>

</template>

<style lang='scss'>
.location-window {
  max-width: min(750px, 50vw);

  h3 {
    font-size: 1.5rem;
    text-wrap: balance;
    white-space: break-spaces;
    max-inline-size: 50ch;
    min-width: 350px;
    max-width: min-content;
  }

  .details-card-expand {
    width: 100%;
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s cubic-bezier(0.3, 0, 0.8, 0.15);

    .v-timeline {
      display: grid;
      height: auto;
      //direction: rtl;
    }

    .details-card {
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.3, 0, 0.8, 0.15);
    }
  }

  &.expanded .details-card-expand {
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);

    .details-card {
      opacity: 1;
      transition: opacity 0.3s cubic-bezier(0.05, 0.7, 0.1, 1);
    }
  }
}
</style>

<script setup lang='ts'>
import { DonationLocationDate } from '@/types'
import { computed, reactive } from 'vue'
import { useOpeningTime } from '@/composables/useOpeningTime'

const { locations, location } = defineProps<Props>()
const emit = defineEmits<Emits>()

type Props = {
  locations: DonationLocationDate[]
  location?: DonationLocationDate,
  closeBtn?: boolean
}

type Emits = {
  close: []
}

const settings = reactive<{
  time: 'isOpen' | 'willOpen' | ''
  query: string | undefined,
  menu: boolean
}>({
  query: location?.donationLocation.name,
  time: 'isOpen',
  menu: false
})


const items = computed(() => {
  return locations.map((item) => ({
    title: item.name,
    value: item.name,
    subtitle: item.city,
    time: useOpeningTime(item.dateOpen, item.dateClose),
    from: item.dateOpen,
    to: item.dateClose
  }))
    .filter((item) =>
      settings.time === 'isOpen' ? item.time.isOpen
        : settings.time === 'willOpen' ? item.time.willOpen
          : true)
    .map(item => {
      if (!settings.time) {
        return Object.assign(item, { subtitle: `${item.subtitle || ''} - ${item.time.openingTime} - ${item.time.closingTime}` })
      }
      return item
    })
})


const customFilter: any = (_value: any, query: any, any) => {
  return !!(item?.raw.title?.includes(query)
    || item?.raw.subtitle?.includes(query)
  )
}


</script>

<template>
  <v-card elevation='0' class='pa-5 search-card'>
    <div class='search-header d-flex flex-row'>
      <h2 v-t="'search.title'" />
      <v-radio-group
        v-model='settings.time'
        hide-details
        inline
        class='select-time'
        :mandatory='false'
      >
        <v-radio
          :label='$t("search.isOpen")'
          value='isOpen'
        />
        <v-radio
          :label='$t("search.willOpen")'
          value='willOpen'
        />
      </v-radio-group>
    </div>
    <v-autocomplete
      eager
      clearable
      @click:clear='Object.assign(settings, { query: null, time: null })'
      :placeholder="$t('search.description')"
      v-model='settings.query'
      :model-value:menu='settings.menu'
      :custom-filter='customFilter'
      hide-details
      auto-select-first
      variant='outlined'
      :menu-props="{ 'class': 'rounded-menu' }"
      rounded
      :items='items'
      :no-data-text="$t('search.noData')"
    >
      <template #item='{ item, props: { title, ...itemProps} }'>
        <v-list-item v-bind='itemProps'>
          <v-list-item-title>
            <span v-text='item.raw.title' />
            <template v-if='settings.time'>
              <v-chip
                class='mx-3'
                v-if='typeof item?.raw.from === "number" && typeof item?.raw.to === "number"'
                :color='item.raw.time.willCloseSoon ? "primary" : item?.raw?.time.isOpen ? "secondary" : "default"'
                :text='$t("location.time.timeRelative", [item?.raw.from, item?.raw.to])'
              />
            </template>
          </v-list-item-title>
          <v-list-item-subtitle>
            <span v-text='item.raw.subtitle' />
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-autocomplete>
    <v-card-actions>
      <v-btn
        v-if='closeBtn'
        :text="$t('common.close')"
        @click="emit('close')"
        color='secondary'
        variant='outlined'
      />
      <v-btn
        :text="$t('common.search')"
        color='primary'
        variant='tonal'
        class='my-4 flex-1-1'
        :href='`/donation-location/${settings.query}`'
        :disabled='settings.query === location?.name'
      />
    </v-card-actions>
  </v-card>
</template>


<style lang='scss'>

.search-card {
  width: clamp(200px, 80vw, 800px) !important;

  .select-time {
    justify-items: end;
  }
}

.rounded-menu > .v-overlay__content {
  border-radius: 20px !important;
  overflow: hidden;
}
</style>

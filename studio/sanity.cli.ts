import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '23z8qxu4',
    dataset: 'production'
  },
  studioHost: 'epitomestudio',
  deployment: {
    appId: 'zezo5f6v11p7h396y6k228yo',
    autoUpdates: true
  }
})

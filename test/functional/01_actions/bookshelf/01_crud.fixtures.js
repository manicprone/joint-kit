export const specFixtures = {
  user: {
    modelName: 'User',
    fields: [
      { name: 'username', type: 'String', required: true },
      { name: 'display_name', type: 'String' }
    ]
  },
  blogProfile: {
    modelName: 'Profile',
    fields: [
      { name: 'user_id', type: 'Number', required: true },
      { name: 'title', type: 'String', required: true },
      { name: 'is_live', type: 'Boolean', defaultValue: false }
    ]
  },
  projectProfile: {
    modelName: 'Project',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'alias', type: 'String', locked: true },
      { name: 'brief_description', type: 'String' }
    ]
  },
  projectProject: {
    modelName: 'Project',
    fields: [
      { name: 'name', type: 'String', required: true }
    ]
  },
  projectProfileDefaultAlias: (defaultAlias) => ({
    modelName: 'Project',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'alias', type: 'String', locked: true, defaultValue: defaultAlias },
      { name: 'brief_description', type: 'String' }
    ]
  }),
  appMgmt: {
    appSettings: {
      modelName: 'AppSettings',
      fields: [
        { name: 'app_id', type: 'String', required: true, lookup: true },
        { name: 'data', type: 'JSON', required: true }
      ]
    },
    appSettingsOperatorContains: {
      modelName: 'AppSettings',
      fields: [
        { name: 'app_id', type: 'String', required: true, lookup: true, operators: ['contains'] },
        { name: 'data', type: 'JSON', required: true }
      ]
    },
    appSettingsAppIdNotRequired: {
      modelName: 'AppSettings',
      fields: [
        { name: 'app_id', type: 'String', lookup: true },
        { name: 'data', type: 'JSON', required: true }
      ]
    }
  }
}

export const inputFixtures = {
  appMgmt: {
    exact: (appId, data = { a: true, b: false, c: 'string-value' }) => ({
      fields: {
        app_id: appId,
        data
      }
    }),
    contains: (appId, data = { a: true, b: false, c: 'string-value' }) => ({
      fields: {
        'app_id.contains': appId,
        data
      }
    })
  }
}

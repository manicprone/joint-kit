export const specFixtures = {
  normal: {
    main: {
      modelName: 'Project',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'alias', type: 'String', requiredOr: true },
      ],
    },
    association: {
      name: 'coding_language_tags',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'key', type: 'String', requiredOr: true },
      ],
    },
  },
  noMain: {
    association: {
      name: 'coding_language_tags',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'key', type: 'String', requiredOr: true },
      ],
    },
  },
  noAsso: {
    main: {
      modelName: 'Project',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'alias', type: 'String', requiredOr: true },
      ],
    },
  },
  noAssoName: {
    main: {
      modelName: 'Project',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'alias', type: 'String', requiredOr: true },
      ],
    },
    association: {
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'key', type: 'String', requiredOr: true },
      ],
    },
  },
  mainModelNotExist: {
    main: {
      modelName: 'AlienProject',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'alias', type: 'String', requiredOr: true },
      ],
    },
    association: {
      name: 'coding_language_tags',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'key', type: 'String', requiredOr: true },
      ],
    },
  },
  assoNameNotExist: {
    main: {
      modelName: 'Project',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'alias', type: 'String', requiredOr: true },
      ],
    },
    association: {
      name: 'alienTags',
      fields: [
        { name: 'id', type: 'Number', requiredOr: true },
        { name: 'key', type: 'String', requiredOr: true },
      ],
    },
  },
}

export const inputFixtures = {
  normal: {
    main: { fields: { id: 1 } },
    association: { fields: { id: 1 } },
  },
  noMain: { association: { fields: { id: 1 } } },
  noAsso: { main: { fields: { id: 1 } } },
}


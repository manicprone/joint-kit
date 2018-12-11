import objectUtils from '../utils/object-utils'
import registerModelBookshelf from '../models/bookshelf/registerModel'
import buildRouterExpress from '../routers/express/buildRouter'
import JointError from './errors/JointError'
import MODEL from './constants/model-config-constants'
import METHOD from './constants/method-config-constants'

const namespace = 'JOINT'
const debug_registerModels = false
const debug_registerMethods = false

// -----------------------------------------------------------------------------
// Register models from service...
// -----------------------------------------------------------------------------
export function registerModelsFromService(joint, log = true) {
  if (log) {
    console.log('----------------------------------------------------')
    console.log('Loading resource models from service')
    console.log('----------------------------------------------------')
  }

  // TODO ...

  if (log) console.log('')
}

// -----------------------------------------------------------------------------
// Register models from model config...
// -----------------------------------------------------------------------------
export function registerModels(joint, log = true) {
  const service = joint.service
  const serviceKey = joint.serviceKey
  const modelDefs = joint.modelConfig

  // Prepare model registries...
  if (!joint.model) {
    joint.model = {}
    joint.modelByTable = {}
    joint.modelNameByTable = {}
  }

  if (log) {
    console.log('----------------------------------------------------')
    console.log('Registering resource models')
    console.log('----------------------------------------------------')
  }

  // Load the register function for the service implementation...
  let registerModel = null
  switch (serviceKey) {
    case 'bookshelf': {
      registerModel = registerModelBookshelf
    }
  }
  if (!registerModel) {
    const message = `Could not find registerModel logic for service: ${serviceKey}`
    throw new JointError({ message })
  }

  // Register model definitions...
  if (modelDefs && Array.isArray(modelDefs) && modelDefs.length > 0) {
    modelDefs.forEach((modelDef) => {
      const modelName = modelDef[MODEL.NAME]

      // Only register new entries...
      if (!joint.model[modelName]) {
        if (log) console.log(`${modelName}`)

        if (debug_registerModels) {
          console.log(`[${namespace}] generate:registerModels => (modelDef)`)
          console.log(modelDef)
          console.log('')
        }

        const modelObject = registerModel(service, modelDef, modelName, debug_registerModels)
        joint.model[modelName] = modelObject
        joint.modelByTable[modelDef.tableName] = modelObject
        joint.modelNameByTable[modelDef.tableName] = modelName
      } else if (log) {
        console.log(`${modelName} (already registered)`)
      }
    })
  } else if (log) {
    console.log('no models configured')
  }

  if (log) console.log('')
} // END - registerModels

// -----------------------------------------------------------------------------
// Register methods from method config...
//
// TODO: Do not register methods, if the modelName does not exist !?!?!?
//       (At least, report a warning in the log)
// -----------------------------------------------------------------------------
export function registerMethods(joint, log = true) {
  const resources = joint.methodConfig

  // Prepare method registries...
  if (!joint.method) {
    joint.method = {}
    joint.specByMethod = {}
  }

  if (resources && Array.isArray(resources) && resources.length > 0) {
    resources.forEach((resourceConfig) => {
      const modelNameForResource = resourceConfig.modelName
      const methods = resourceConfig.methods

      // Register resource...
      joint.method[modelNameForResource] = {}
      joint.specByMethod[modelNameForResource] = {}

      if (log) {
        console.log('----------------------------------------------------')
        console.log('Registering methods for resource:', modelNameForResource)
        console.log('----------------------------------------------------')
      }

      // Load all methods...
      if (methods && Array.isArray(methods) && methods.length > 0) {
        methods.forEach((methodDef) => {
          const methodName = methodDef[METHOD.NAME]
          const jointAction = methodDef.action
          const methodSpec = methodDef.spec
          methodSpec[METHOD.MODEL_NAME] = modelNameForResource

          if (debug_registerMethods) {
            console.log(`[${namespace}] ============================================ [DEBUG]`)
            console.log(methodDef)
            console.log('=============================================================')
          }

          // Add method spec to registry (for lookup convenience)...
          joint.specByMethod[modelNameForResource][methodName] = methodSpec

          // Generate method logic and add to registry...
          const methodLogic = generateMethod(joint, jointAction, methodSpec)
          if (methodLogic) {
            joint.method[modelNameForResource][methodName] = methodLogic
            if (log) console.log(`${modelNameForResource}.${methodName}`)
          } else if (log) {
            console.log(`x  ${modelNameForResource}.${methodName} (unknown action: ${jointAction})`)
          }
        })
      } else if (log) {
        console.log('no methods configured')
      }
    }) // end-resources.forEach
  }

  if (log) console.log('')
} // END - registerMethods

function generateMethod(joint, action, spec) {
  if (!objectUtils.has(joint, action)) return null

  return function (input) { return joint[action](spec, input) }
} // END - generateMethod

// -----------------------------------------------------------------------------
// Build router from route config...
// -----------------------------------------------------------------------------
export function buildRouter(joint, log = true) {
  const serverKey = joint.serverKey
  const server = joint.server
  const routeDefs = joint.routeConfig

  if (log) {
    console.log('----------------------------------------------------')
    console.log(`Building API router (${serverKey})`)
    console.log('----------------------------------------------------')
  }

  // Exit if a server instance is not loaded or is not recognized/supported...
  if (!server) {
    const message = 'A server must be configured to generate a Joint router.'
    throw new JointError({ message })
  }
  if (!serverKey) {
    const message = 'Could not generate a router. The provided server is either not recognized or not supported by Joint.'
    throw new JointError({ message })
  }

  // Load the buildRouter function for the server implementation...
  let performBuildRouter = null
  switch (serverKey) {
    case 'express': {
      performBuildRouter = buildRouterExpress
    }
  }

  // Build the router, and add to the joint instance...
  if (routeDefs && Array.isArray(routeDefs) && routeDefs.length > 0) {
    joint.router = performBuildRouter(joint, routeDefs, log)
  } else if (log) {
    console.log('no routes configured')
  }

  if (log) console.log('')
} // END - registerModels

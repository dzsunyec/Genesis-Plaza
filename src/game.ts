//import utils from '../node_modules/decentraland-ecs-utils/index'
import { placeTeleports } from './modules/teleports'
import { placePlatforms } from './modules/platforms'
import { addWearables } from './modules/wearables'
import {
  placeMuseumPieces,
  placeTradecenterPieces,
  placeGardenPieces,
  placeWearablePieces,
} from './modules/museumItems'
import { addScreen } from './modules/video'
import { addBuildings } from './modules/buildings'
import { addFaceUserSystem } from './modules/npcFaceUserSystem'
import { addRobots } from './modules/npcRobotBuilder'
import { addNFTs } from './modules/nftBuilder'
import { addPiano } from './piano/pianoBuilder'
import { updateMarketData } from './modules/serverHandler'
import { AmbientSound } from './modules/ambientSound'
import { addZenquencer } from './zenquencer/zenquencerBuilder'
import { createEventsBoard } from './modules/eventBoard'
import { addOneTimeTrigger } from './modules/Utils'
import { getUserData, getUserPublicKey } from '@decentraland/Identity'
import Meta from '../metas/sammich/sammich'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

//////// LOG PLAYER POSITION

Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
  log(`pos: `, Camera.instance.position)
  log(`rot: `, Camera.instance.rotation)
})

//// ADD BUILDINGS

addBuildings()

/// MOVING PLATFORMS

placePlatforms()

///TELEPORTERS

placeTeleports()

/// VIDEO SCEREEN

addScreen()

/// EVENTS BOARD

createEventsBoard({
  position: new Vector3(175.8, 3.5, 168),
  rotation: Quaternion.Euler(0, 225, 0),
})

/// WEARABLES

addOneTimeTrigger(new Vector3(180, 2, 244), new Vector3(60, 60, 60), () => {
  placeMuseumPieces()
})

/// MUSEUM

addOneTimeTrigger(new Vector3(273, 2, 127), new Vector3(50, 50, 50), () => {
  addWearables()
  placeWearablePieces()
})

/// TRADE CENTER

addOneTimeTrigger(new Vector3(269, 5, 37), new Vector3(80, 80, 80), () => {
  updateMarketData()
  placeTradecenterPieces()
})

/// GARDEN

addOneTimeTrigger(new Vector3(118, 3, 39), new Vector3(60, 60, 60), () => {
  placeGardenPieces()
})

/// ROBOTS
const dummyTarget = new Entity()
dummyTarget.addComponent(new PlaneShape())
dummyTarget.addComponent(new Transform())

addFaceUserSystem(dummyTarget)
addRobots(dummyTarget)

/// NFTS
addNFTs()

/// Piano
// BUG: need to hot reload for the red out of bound indicators to disappear - works fine when deployed
addPiano()

/// Sequencer Fountain
addZenquencer()

/// AMBIENT SOUNDS

let forest1 = new AmbientSound(
  { position: new Vector3(215, 2, 183) },
  'sounds/Forest.mp3',
  0,
  true,
  0.6
)

let forest2 = new AmbientSound(
  { position: new Vector3(117, 2, 42) },
  'sounds/Forest2.mp3',
  0,
  true,
  0.6
)

// let thunder = new AmbientSound(
//   { position: new Vector3(43, 45, 113) },
//   'sounds/thunder.mp3',
//   0,
//   true,
//   0.2
// )

/// METAS

/***
 * SAMMICH-GAME CODE BELLOW
 */
const landOwnerData = {
  host_data: `{
	  "sammichgame":{
		"position":{"x":${9 * 16 - 11.1},"y":1.4,"z":${9 * 16 + 8}},
		"rotation":{"x":0,"y":270,"z":0},
		"scale":{"x":1.2, "y":1.05, "z":1},     
		"hideBoard": false,
		"hideAd": true,
		"gameID": "0,0",
		"soundDistance": 16,
		"showScenario": false,
		"hideFrame": true,
		"showJoinVoice": false,
		"voiceChannel": "dcl-sammich-game",
		"serverWs": "wss://mana-fever.com",
		"serverHttp":  "https://mana-fever.com"
	  }
   }`,
}
const sammichFrame = new Entity()
const sammichFrameShape = new GLTFShape('models/sammich-screen.glb')
sammichFrameShape.isPointerBlocker = false
sammichFrame.addComponent(sammichFrameShape)
sammichFrame.addComponent(
  new Transform({
    position: new Vector3(9 * 16 - 11, 0.5, 9 * 16 + 8),
    scale: new Vector3(1.2, 1.2, 1.2),
    rotation: Quaternion.Euler(0, 90, 0),
  })
)
engine.addEntity(sammichFrame)

engine.addSystem(new Meta({ getUserData, getCurrentRealm }, landOwnerData))

// Chess game

import { PawnsSquare } from '../metas/pawnssquare/pawnssquare'
import { userDat } from '../metas/pawnssquare/modules/dat/gameData'

const FetchuserInformation = async () => {
  const userInfo = await getUserData()
  if (userInfo !== undefined) userDat.setUID(userInfo.displayName)
  else userDat.setUID('Guest' + Math.floor(Math.random() * 1000000))

  const publicKeyInfo = await getUserPublicKey()
  userDat.setETHAdd(publicKeyInfo)

  const realm = await getCurrentRealm()
  userDat.setRealm(realm.displayName)
}

FetchuserInformation()
  .then(() => {
    const chessBoardLandOwnerData = {
      host_data: `{
			"time_control": 600,
			"system_pivot": {
			  "position": {"x":184, "y":1.2, "z":93.7},
			  "scale": {"x":1, "y":1, "z":1}
			},
			"chessboard": {
				"visible": true,
				 "position": {"x":184, "y":1.2, "z":93.7},
				"scale": {"x":1.1, "y":1.1, "z":1.1}
			},
			"decoration_bottom": {
				"visible": true,
				"position": {"x":184, "y":0.7, "z":93.7},
				"rotation": {"x":0, "y":0, "z":0},
				"scale": {"x":0.8, "y":0.8, "z":0.8}
			}
		}`,
    }

    new PawnsSquare(chessBoardLandOwnerData)
  })
  .catch((err) => {
    log("Can't load Pawn's Square, fetch user data failed", err)
  })

// const mzAPI = new MetaZoneAPI(
//   getProvider,
//   getUserData,
//   getCurrentRealm,
//   EthereumController,
//   EthConnect,
//   dcl,
//   () => {
//     const chessBoardLandOwnerData = {
//       host_data: `{
//               "time_control": 600,
//               "system_pivot": {
//                   "position": {"x":180, "y":1.2, "z":152},
//                   "scale": {"x":1, "y":1, "z":1}
//               },
//               "chessboard": {
//                   "visible": true,
// 				  "position": {"x":180, "y":1.2, "z":152},
//                   "scale": {"x":1, "y":1, "z":1}
//               },
//               "decoration_bottom": {
//                   "visible": true,
// 				  "position": {"x":180, "y":0.7, "z":152},
//                   "rotation": {"x":0, "y":0, "z":0},
//                   "scale": {"x":1, "y":1, "z":1}
//               },
//               "decoration_top":{
//                   "visible": true,
// 				  "position": {"x":180, "y":0.7, "z":152},
//                   "rotation": {"x":0, "y":0, "z":0},
//                   "scale": {"x":1, "y":1, "z":1}
//               }
//           }`,
//     }
//     engine.addSystem(new PawnsSquare(mzAPI, chessBoardLandOwnerData))
//   }
// )

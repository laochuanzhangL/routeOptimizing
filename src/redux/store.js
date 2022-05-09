import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { userInfoSliceReducer } from './reducers'

const rootReducer = combineReducers({
  userInfo: userInfoSliceReducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

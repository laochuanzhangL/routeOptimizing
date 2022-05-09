import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userId: null,
}

export const userInfoSlice = createSlice({
  //命名空间
  name: 'userInfo',
  //初始值
  initialState,

  reducers: {
    getUserId: (state, action) => {
      state.userId = action.payload
    },
  },
  extraReducers: {},
})

export const userInfoSliceReducer = userInfoSlice.reducer
export const { getUserId: getUserIdAC } = userInfoSlice.actions

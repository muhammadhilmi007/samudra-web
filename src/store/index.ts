// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import branchReducer from './slices/branchSlice';
import divisionReducer from './slices/divisionSlice';
import customerReducer from './slices/customerSlice';
import vehicleReducer from './slices/vehicleSlice';
import employeeReducer from './slices/employeeSlice';
import pickupRequestReducer from './slices/pickupRequestSlice';
import sttReducer from './slices/sttSlice';
import loadingReducer from './slices/loadingSlice';
import deliveryReducer from './slices/deliverySlice';
import returnReducer from './slices/returnSlice';
import collectionReducer from './slices/collectionSlice';
import financeReducer from './slices/financeSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
    division: divisionReducer,
    customer: customerReducer,
    vehicle: vehicleReducer,
    employee: employeeReducer,
    pickupRequest: pickupRequestReducer,
    stt: sttReducer,
    loading: loadingReducer,
    delivery: deliveryReducer,
    return: returnReducer,
    collection: collectionReducer,
    finance: financeReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/refreshToken/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.token'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
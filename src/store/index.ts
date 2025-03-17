// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import divisionReducer from './slices/divisionSlice';
import branchReducer from './slices/branchSlice';
import employeeReducer from './slices/employeeSlice';
import customerReducer from './slices/customerSlice';
import vehicleReducer from './slices/vehicleSlice';
import pickupRequestReducer from './slices/pickupRequestSlice';
import sttReducer from './slices/sttSlice';
import loadingReducer from './slices/loadingSlice';
import deliveryReducer from './slices/deliverySlice';
import returnReducer from './slices/returnSlice';
import collectionReducer from './slices/collectionSlice';
import financeReducer from './slices/financeSlice';
import reportReducer from './slices/reportSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    division: divisionReducer,
    branch: branchReducer,
    employee: employeeReducer,
    customer: customerReducer,
    vehicle: vehicleReducer,
    pickupRequest: pickupRequestReducer,
    stt: sttReducer,
    loading: loadingReducer,
    delivery: deliveryReducer,
    return: returnReducer,
    collection: collectionReducer,
    finance: financeReducer,
    report: reportReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/refreshToken/fulfilled',
          'stt/generateSTTPDF/fulfilled',
          'loading/generateDMB/fulfilled',
          'delivery/generateDeliveryForm/fulfilled',
          'collection/generateInvoice/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.token'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
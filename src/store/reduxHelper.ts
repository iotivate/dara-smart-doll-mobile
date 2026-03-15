// Utils/reduxHelper.ts
import { ActionReducerMapBuilder, AsyncThunk, AnyAction } from "@reduxjs/toolkit";

export function handleAsyncThunk<T extends { [key: string]: any }>(
    builder: ActionReducerMapBuilder<T>,
    thunk: AsyncThunk<any, any, any>,
    stateKey: keyof T
) {
    builder
        .addCase(thunk.pending, (state: any) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(thunk.fulfilled, (state: any, action: AnyAction) => {
            state.loading = false;
            state[stateKey] = action.payload; // 👈 Auto-assign to provided state key
        })
        .addCase(thunk.rejected, (state: any, action: AnyAction) => {
            state.loading = false;
            state.error = action.error.message || "Something went wrong";
        });
}

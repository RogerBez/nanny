/**
 * POST / (mounted at /freeze)
 * Freeze a child account due to high-risk activity
 * GET /:childId to check freeze status
 * POST /unfreeze to unfreeze
 */
import type { FreezeStore } from '../types/index';
declare const router: import("express-serve-static-core").Router;
declare const freezeStore: FreezeStore;
export { router, freezeStore };
//# sourceMappingURL=freeze.d.ts.map
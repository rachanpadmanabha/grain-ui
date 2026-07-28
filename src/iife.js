/**
 * Browser-global entry point, used by the `<script src=...>` builds.
 *
 * Assigning the namespace by hand keeps esbuild's CommonJS interop helpers
 * (~700 bytes) out of a bundle whose only job is to set one global. The ESM
 * entry in `index.js` is what npm consumers import.
 */

import {
  GrainDropdown,
  GrainModal,
  GrainTabs,
  GrainToast,
  register,
  registerGrainDropdown,
  registerGrainModal,
  registerGrainTabs,
  registerGrainToast
} from "./index.js";

const GrainUI = {
  GrainDropdown,
  GrainModal,
  GrainTabs,
  GrainToast,
  register,
  registerGrainDropdown,
  registerGrainModal,
  registerGrainTabs,
  registerGrainToast
};

if (typeof window !== "undefined") {
  window.GrainUI = GrainUI;
  // Predates the GrainUI global, which was broken until 0.2.0. Kept so
  // existing CDN pages keep working.
  window.GrainToast = GrainToast;
}

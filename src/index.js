import {
  GrainToast,
  registerGrainToast
} from "./components/web-components/grain-toast.js";
import {
  GrainTabs,
  registerGrainTabs
} from "./components/web-components/grain-tabs.js";
import {
  GrainModal,
  registerGrainModal
} from "./components/web-components/grain-modal.js";
import {
  GrainDropdown,
  registerGrainDropdown
} from "./components/web-components/grain-dropdown.js";

export { GrainToast, GrainTabs, GrainModal, GrainDropdown };

/** Defines every Grain custom element. Safe to call more than once. */
export const register = () => {
  registerGrainToast();
  registerGrainTabs();
  registerGrainModal();
  registerGrainDropdown();
};

export {
  registerGrainToast,
  registerGrainTabs,
  registerGrainModal,
  registerGrainDropdown
};

register();

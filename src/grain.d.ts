/**
 * Type definitions for Grain UI.
 *
 * Grain's components are driven by markup, so these types mainly describe the
 * imperative escape hatches: the element classes, their methods, and the
 * events they emit.
 */

export interface GrainToastOptions {
  /** Controls the toast's colour treatment. Defaults to `"default"`. */
  type?: "default" | "success" | "info" | "error" | "danger" | (string & {});
  /** Milliseconds before auto-dismiss. Values `<= 0` keep it until removed. */
  duration?: number;
}

export declare class GrainToast extends HTMLElement {
  /** Appends a toast to the shared live region and returns it. */
  static show(message: string, options?: GrainToastOptions): GrainToast;
}

export interface GrainTabsChangeDetail {
  index: number;
  tab: HTMLElement | undefined;
  panel: HTMLElement | undefined;
}

export declare class GrainTabs extends HTMLElement {
  /** Index of the tab currently marked `aria-selected="true"`. */
  readonly selectedIndex: number;
  /** Activates a tab by index, optionally moving focus to it. */
  select(index: number, moveFocus?: boolean): void;
  addEventListener<K extends keyof GrainTabsEventMap>(
    type: K,
    listener: (this: GrainTabs, ev: GrainTabsEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

export interface GrainTabsEventMap {
  "grain-change": CustomEvent<GrainTabsChangeDetail>;
}

export declare class GrainModal extends HTMLElement {
  /** Whether the wrapped `<dialog>` is currently open. */
  readonly isOpen: boolean;
  /** Opens the dialog, preferring `showModal()` where available. */
  open(): void;
  /** Closes the dialog. Emits `grain-close` for every close path. */
  close(): void;
  addEventListener<K extends keyof GrainModalEventMap>(
    type: K,
    listener: (this: GrainModal, ev: GrainModalEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

export interface GrainModalEventMap {
  "grain-open": CustomEvent<undefined>;
  "grain-close": CustomEvent<undefined>;
}

export declare class GrainDropdown extends HTMLElement {
  /** Opens the menu and focuses the item at `focusIndex`. */
  open(focusIndex?: number): void;
  /** Closes the menu, returning focus to the summary unless told otherwise. */
  close(focusSummary?: boolean): void;
}

/** Defines every Grain custom element. Safe to call more than once. */
export declare function register(): void;

export declare function registerGrainToast(): void;
export declare function registerGrainTabs(): void;
export declare function registerGrainModal(): void;
export declare function registerGrainDropdown(): void;

declare global {
  interface HTMLElementTagNameMap {
    "grain-toast": GrainToast;
    "grain-tabs": GrainTabs;
    "grain-modal": GrainModal;
    "grain-dropdown": GrainDropdown;
  }

  interface Window {
    /** @deprecated Prefer the `GrainUI` global or an npm import. */
    GrainToast: typeof GrainToast;
  }
}

import { create } from 'zustand';

interface FocusLockStore {
  isFocusLocked: boolean;
  showExitModal: boolean;
  sessionLabel: string;
  onEndSession: (() => void) | null;
  lockSession: (label?: string, onEnd?: () => void) => void;
  unlockSession: () => void;
  requestExit: () => void;
  keepFocusing: () => void;
  confirmEndSession: () => void;
}

export const useFocusLockStore = create<FocusLockStore>((set, get) => ({
  isFocusLocked: false,
  showExitModal: false,
  sessionLabel: 'Focus session',
  onEndSession: null,

  lockSession: (label = 'Focus session', onEnd) =>
    set({
      isFocusLocked: true,
      showExitModal: false,
      sessionLabel: label,
      onEndSession: onEnd ?? null,
    }),

  unlockSession: () =>
    set({
      isFocusLocked: false,
      showExitModal: false,
      onEndSession: null,
    }),

  requestExit: () => {
    if (!get().isFocusLocked) return;
    set({ showExitModal: true });
  },

  keepFocusing: () => set({ showExitModal: false }),

  confirmEndSession: () => {
    const { onEndSession } = get();
    set({ isFocusLocked: false, showExitModal: false, onEndSession: null });
    onEndSession?.();
  },
}));

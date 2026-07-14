import { useEffect, RefObject } from 'react';

// Android keyboards (Gboard/Samsung) silently replace a typed word with a dictionary
// prediction — e.g. BELGA → BELGICKO — and ignore autoCorrect/autoComplete="off".
// No HTML attribute reliably stops this on Android. The swap arrives as a native
// `beforeinput` event with inputType "insertReplacementText"; cancelling that event
// keeps the user's literal typing intact. Normal keystrokes come through other
// inputTypes (insertText / insertCompositionText) and are left untouched, so typing
// still works — only the auto-correct/suggestion REPLACEMENT is blocked, which is
// exactly what we want for a name field (the user typed BELGA, they want BELGA).
//
// A native listener is used (not React's synthetic onBeforeInput) because the
// synthetic event is unreliable/absent across browser versions. Runs on all
// platforms: on iOS/desktop with spellCheck already off this event basically never
// fires, so it's a harmless no-op there and covers Android phones AND tablets/
// Chromebooks regardless of user-agent sniffing quirks.
export function useBlockAutocorrect(ref: RefObject<HTMLInputElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      if ((e as InputEvent).inputType === 'insertReplacementText') {
        e.preventDefault();
      }
    };
    el.addEventListener('beforeinput', handler);
    return () => el.removeEventListener('beforeinput', handler);
  }, [ref]);
}

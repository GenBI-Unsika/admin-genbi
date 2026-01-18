export function waitForGoogleIdentity({ timeoutMs = 8000 } = {}) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const google = window.google;
      if (google?.accounts?.id) return resolve(google.accounts.id);

      if (Date.now() - started > timeoutMs) {
        return reject(new Error('Google Identity Services not loaded'));
      }

      setTimeout(tick, 50);
    };

    tick();
  });
}

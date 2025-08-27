import LogRocket from 'logrocket';

const initLogRocket = () => {
  if (process.client) {
    LogRocket.init('v8rkr/iris');

    getCurrentUser().then((userData) => {
      if (userData) {
        LogRocket.identify(userData.uid, {
          name: userData.displayName ?? 'ERR_GETTING_USER',
          email: userData.email ?? 'ERR_GETTING_EMAIL',
        });
      }
    });
  }
};

export { initLogRocket };

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToAuth() {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes('Login')) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
}

export function resetToHome() {
  if (!navigationRef.isReady()) return;

  const state = navigationRef.getRootState();
  const routeNames = state?.routeNames || [];

  if (!routeNames.includes('Main')) {
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Inicio' } }],
    })
  );
}

export default navigationRef;

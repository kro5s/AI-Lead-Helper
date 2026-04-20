import { AUTH_CHANGE_EVENT, AUTH_TOKEN_KEY, MOCK_ACCESS_TOKEN } from '../constants/auth';

export function getAccessToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function setMockAccessToken() {
  window.localStorage.setItem(AUTH_TOKEN_KEY, MOCK_ACCESS_TOKEN);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

export function clearAccessToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

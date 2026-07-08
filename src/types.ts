export type FormData = {
  email: string;
  timezone: string;
  franja: string[];
  laptop: string;
  zoom: string;
  circle: string;
  mouseTouchpad: string;
  windowsMac: string;
  contactMethods: string[];
  hoursPerWeek: string;
  anythingElse: string;
};

export const INITIAL_FORM_DATA: FormData = {
  email: '',
  timezone: '',
  franja: [],
  laptop: '',
  zoom: '',
  circle: '',
  mouseTouchpad: '',
  windowsMac: '',
  contactMethods: [],
  hoursPerWeek: '',
  anythingElse: '',
};

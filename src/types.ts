export type FormData = {
  timezone: string;
  franja: string[];
  laptop: string;
  zoom: string;
  circle: string;
  mouseTouchpad: string;
  windowsMac: string;
  anythingElse: string;
};

export const INITIAL_FORM_DATA: FormData = {
  timezone: '',
  franja: [],
  laptop: '',
  zoom: '',
  circle: '',
  mouseTouchpad: '',
  windowsMac: '',
  anythingElse: '',
};

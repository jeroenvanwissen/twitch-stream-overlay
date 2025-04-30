export const pad = (number: string | number, places = 2): string => {
  if (typeof number !== "undefined") {
    const zero = places - number.toString().length + 1;

    return Array(+(zero > 0 && zero)).join("0") + number;
  }
  return "";
};

export const shuffle = <T>(array: Array<T>): Array<T> => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * * Group Array of objects by key.
 * * Sort by key (optional)
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} key Sort key
 */
export const groupBy = <T>(array: T[], key: string): T[][] => {
  const list: any = {};

  array.map((element: any) => {
    list[element[key]] = array.filter((el: any) => el[key] == element[key]);
  });

  return list;
};

/**
 * Get URL parameter by name
 * @param {string} name Parameter name
 * @param {string} url URL
 * @returns {string} Parameter value
 */
export const getParameterByName = <T extends number | string>(
  name: string,
  url = window.location.href,
): T | null => {
  name = name.replace(/[[\]]/gu, "\\$&");

  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`, "u");
  const results = regex.exec(url);

  if (!results || !results[2]) {
    return null;
  }

  const value = decodeURIComponent(results[2].replace(/\+/gu, " "));

  if (!isNaN(Number(value))) {
    return Number(value) as T;
  }
  return value as T;
};

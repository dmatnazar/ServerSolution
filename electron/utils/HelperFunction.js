const ping = require('ping')

const uuid = {
  1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};



function assertString(input) {
  const isString = typeof input === "string";

  if (!isString) {
    let invalidType = typeof input;
    if (input === null) invalidType = "null";
    else if (invalidType === "object") invalidType = input.constructor.name;

    throw new TypeError(`Expected a string but received a ${invalidType}`);
  }
}

function isUUID(str, version) {
  assertString(str);
  const pattern = uuid[![undefined, null].includes(version) ? version : "all"];
  return !!pattern && pattern.test(str);
}

function ObjectToENV(object) {
  const env = Object.entries(object)
    .map(([key, value]) => `${key} = ${value}`)
    .join("\n");
  return env
}

module.exports = {
  isUUID,
  ObjectToENV
};

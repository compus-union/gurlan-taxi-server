const MIN = 1000000;
const MAX = 9999999;

async function createId(field) {
  const random = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

  if (field === "client") {
    return `CA${random}`;
  }

  return;
}

module.exports = { createId };

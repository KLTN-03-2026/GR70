const  retry = async (fn, retries = 5, delay = 1000) => {
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 503 && retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}
module.exports = retry;

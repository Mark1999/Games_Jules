export const createLogEntry = (event, details) => {
  return {
    timestamp: new Date().toISOString(),
    event,
    details,
  };
};

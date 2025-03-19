const config_TREE = {
  apiUrl: process.env.REACT_APP_API_URL_TREE || "http://localhost:5000",
};
const config_GRAPH = {
  apiUrl: process.env.REACT_APP_API_URL_GRAPH || "http://localhost:5001",
};

export { config_TREE, config_GRAPH };

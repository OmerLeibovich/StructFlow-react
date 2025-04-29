const config_TREE = {
  apiUrl: process.env.REACT_APP_API_URL_TREE || "http://localhost:5000",
};
const config_GRAPH = {
  apiUrl: process.env.REACT_APP_API_URL_GRAPH || "http://localhost:5001",
};

const config_LINKEDLIST = {
  apiUrl: process.env.REACT_APP_API_URL_LINKED_LIST || "http://localhost:5002",
}

const config_DOUBLELINKEDLIST = {
  apiUrl: process.env.REACT_APP_API_URL_DOUBLE_LINKED_LIST || "http://localhost:5003"
}
const config_ARRAY = {
  apiUrl: process.env.REACT_APP_API_ARRAY || "http://localhost:5004"
}

export { config_TREE, config_GRAPH, config_LINKEDLIST,config_DOUBLELINKEDLIST,config_ARRAY };

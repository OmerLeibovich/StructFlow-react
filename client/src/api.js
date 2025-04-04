import { config_TREE, config_GRAPH, config_LINKEDLIST } from "./config"; 

async function sendRequest(baseUrl, endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    return { error: error.message };
  }
}


export const GRAPH_API = {
  getVideoStreamGraph: () => `${config_GRAPH.apiUrl}/video_feed_Graph?t=${Date.now()}`,
  getLeftMouseClick: (x, y) => sendRequest(config_GRAPH.apiUrl, "/left_mouse_click", "POST", { x, y }),
  getRightMouseClick: (phase, points) => sendRequest(config_GRAPH.apiUrl, "/right_mouse_click", "POST", { phase, points }),
  getLinesDistance: () => sendRequest(config_GRAPH.apiUrl, "/random_numbers_tolines"),
  getDijkstraAlgo: (key) => sendRequest(config_GRAPH.apiUrl, "/Dijkstra_algo", "POST", { key }),
  resetGraph: () => sendRequest(config_GRAPH.apiUrl, "/reset"),
  getgraph: () => sendRequest(config_GRAPH.apiUrl, "/get_graph"),
};

export const TREE_API = {
  getVideoStreamAVL: () => `${config_TREE.apiUrl}/video_feed_AVL_Tree?t=${Date.now()}`,
  getTree: () => sendRequest(config_TREE.apiUrl, "/get_tree"),
  insertNode: (key) => sendRequest(config_TREE.apiUrl, "/insert_AVL", "POST", { key }),
  deleteNode: (key) => sendRequest(config_TREE.apiUrl, "/delete_AVL", "POST", { key }),
  startBFS: () => sendRequest(config_TREE.apiUrl, "/bfs"),
  startDFS: () => sendRequest(config_TREE.apiUrl, "/dfs"),
  resetTree: () => sendRequest(config_TREE.apiUrl, "/reset_AVL"),
  resetBFS: () => sendRequest(config_TREE.apiUrl, "/reset_bfs"),
  resetDFS: () => sendRequest(config_TREE.apiUrl, "/reset_dfs"),
};

export const LINKED_LIST_API = {
  getVideoStreamLinkedList: () => `${config_LINKEDLIST.apiUrl}/video_feed_LinkedList?t=${Date.now()}`,
  insertLinkedList:(key) => sendRequest(config_LINKEDLIST.apiUrl,"/insert_linked_list","POST",{ key })
}


export const SetApplication = (appName) => 
  fetch("http://localhost:4000/set_application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application: appName }),
  }).then(response => response.json());


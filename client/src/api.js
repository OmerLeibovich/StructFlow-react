import { config_TREE, config_GRAPH } from "./config"; 

async function sendRequestTREE(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${config_TREE.apiUrl}${endpoint}`, options);
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

async function sendRequestGRAPH(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${config_GRAPH.apiUrl}${endpoint}`, options);
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
  getLeftMouseClick: (x, y) => sendRequestGRAPH("/left_mouse_click", "POST", { x, y }),
  getRightMouseClick: (phase, points) => sendRequestGRAPH("/right_mouse_click", "POST", { phase, points }),
  getLinesDistance:() => sendRequestGRAPH('/random_numbers_tolines'),
  getDijkstraAlgo: (key) => sendRequestGRAPH('/Dijkstra_algo', "POST", { key }),

};

export const TREE_API = {
  getVideoStreamAVL: () => `${config_TREE.apiUrl}/video_feed_AVL_Tree?t=${Date.now()}`,
  getTree: () => sendRequestTREE("/get_tree"),
  insertNode: (key) => sendRequestTREE("/insert_AVL", "POST", { key }),
  deleteNode: (key) => sendRequestTREE("/delete_AVL", "POST", { key }),
  startBFS: () => sendRequestTREE("/bfs"),
  startDFS: () => sendRequestTREE("/dfs"),
  resetTree: () => sendRequestTREE("/reset_AVL"),
  resetBFS: () => sendRequestTREE("/reset_bfs"),
  resetDFS: () => sendRequestTREE("/reset_dfs"),
};

export const SetApplication = (appName) => 
  fetch("http://localhost:4000/set_application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application: appName }),
  }).then(response => response.json());


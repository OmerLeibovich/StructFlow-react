import { config_TREE, config_GRAPH, config_LINKEDLIST,config_DOUBLELINKEDLIST,config_ARRAY } from "./config"; 

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
  getGraphData: () => sendRequest(config_GRAPH.apiUrl,"/graph_data"),
  getLeftMouseClick: (x, y) => sendRequest(config_GRAPH.apiUrl, "/left_mouse_click", "POST", { x, y }),
  getRightMouseClick: (phase, points) => sendRequest(config_GRAPH.apiUrl, "/right_mouse_click", "POST", { phase, points }),
  getLinesDistance: () => sendRequest(config_GRAPH.apiUrl, "/randomize_weights"),
  resetRightClick: () =>sendRequest(config_GRAPH.apiUrl,"/reset_right_click" , "POST"),
  getDijkstraAlgo: (key) => sendRequest(config_GRAPH.apiUrl, "/Dijkstra_algo", "POST", { key }),
  resetGraph: () => sendRequest(config_GRAPH.apiUrl, "/reset"),
};

export const TREE_API = { 
  getTree: () => sendRequest(config_TREE.apiUrl, "/get_tree_svg"),
  insertNode: (key) => sendRequest(config_TREE.apiUrl, "/insert", "POST", { key }), 
  deleteNode: (key) => sendRequest(config_TREE.apiUrl, "/delete", "POST", { key }),
  startBFS: () => sendRequest(config_TREE.apiUrl, "/BFS"),
  startDFS: () => sendRequest(config_TREE.apiUrl, "/DFS"),
  resetTree: () => sendRequest(config_TREE.apiUrl, "/reset_AVL"),
  resetBFS: () => sendRequest(config_TREE.apiUrl, "/reset_bfs"),
  resetDFS: () => sendRequest(config_TREE.apiUrl, "/reset_dfs"),
};

export const LINKED_LIST_API = {
  getLinkedList: () => sendRequest(config_LINKEDLIST.apiUrl,"/data"),
  insertLinkedList:(key) => sendRequest(config_LINKEDLIST.apiUrl,"/insert","POST",{ key }),
  deleteLinkedList:() => sendRequest(config_LINKEDLIST.apiUrl,"/delete"),
  searchLinkedList:(key) => sendRequest(config_LINKEDLIST.apiUrl,"/search","POST",{ key }),
  resetLinkedList:() => sendRequest(config_LINKEDLIST.apiUrl,"/reset")
}
export const DOUBLE_LINKED_LIST_API ={
  getDoubleLinkedList: () => sendRequest(config_DOUBLELINKEDLIST.apiUrl,"/data"),
  insertDoubleLinkedList:(key,side) => sendRequest(config_DOUBLELINKEDLIST.apiUrl,"/insert_doubleLinkedList","POST",{ key,side }),
  deleteDoubleLinkedList:(side) => sendRequest(config_DOUBLELINKEDLIST.apiUrl,"/delete_doubleLinkedList","POST",{ side }),
  searchDoubleLinkedList:(key,side) => sendRequest(config_DOUBLELINKEDLIST.apiUrl,"/search_node","POST",{key,side}),
  resetDoubleLinkedList:() => sendRequest(config_DOUBLELINKEDLIST.apiUrl,"/reset")
}

export const ARRAY_API ={
  getArray: () => sendRequest(config_ARRAY.apiUrl,"/data"),
  insertArray:(key) => sendRequest(config_ARRAY.apiUrl,"/insert_Array","POST",{ key }),
  removeArray:(key) => sendRequest(config_ARRAY.apiUrl,"/delete_Array","POST",{ key }),
  BubbleSort:() => sendRequest(config_ARRAY.apiUrl,"/Bubble_Sort"),
  CountingSort:() => sendRequest(config_ARRAY.apiUrl,"/Counting_Sort"),
  resetArray:() => sendRequest(config_ARRAY.apiUrl,"/reset_array"),
}


export const SetApplication = (appName) => 
  fetch("http://localhost:4000/set_application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application: appName }),
  }).then(response => response.json());


import { useState} from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { SetApplication,TREE_API,GRAPH_API} from "../src/api"; 
import TreePage from './Tree/AVL_Tree'; 
import Graph from './Graph/Graph';
import LinkedList from './Structures/LinkedList';
import DoubleLinkedList from './Structures/DoubleLinkedList';
import Array from './Structures/Array';

function App() {
  const [show, setShow] = useState({ main: false, tree: false, sorts: false, Graph: false, structures: false });
  const location = useLocation();

  const Reset = async () => {
    await  TREE_API.resetTree();
    await GRAPH_API.resetGraph();
    localStorage.clear();
    sessionStorage.removeItem("sessionActive");
    setShow({ main: false, tree: false, sorts: false, Graph: false, structures: false });
  };

  const handleToggle = (menu, state) => setShow(prev => ({ ...prev, [menu]: state }));
  const handleTogglePage = (page, state) => {
    setShow({ AVL_Tree: false, main: false, tree: false, sorts: false, Graph: false, structures: false });
    setShow(prev => ({ ...prev, [page]: state }));
 
  };

  return (
      <div className="background">
      <header className="header">
        !צריך רק אחד שיאמין בך
      </header>
        <Container fluid>
          <Row className="full-height-row">
            <Col>
              <Button
                className="manudrawer"
                variant="light"
                onClick={() => handleToggle('main', true)}
              >
                Manu
              </Button>
              {/* Main Drawer */}
              <Offcanvas
                show={show.main}
                onHide={() => handleToggle('main', false)}
                placement="end"
                className="offcanvas"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="offcanvas-title">Main Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Button className="manudrawerSubButtons" onClick={() => handleToggle('tree', true)}>
                    Tree
                  </Button>

                  <Button className="manudrawerSubButtons" onClick={() => handleToggle('sorts', true)}>
                    Sorts
                  </Button>

                  <Link to="/graph" className="Sub-button">
                    <Button className="manudrawerSubButtons"
                    
                    onClick={async () => {
                      if (location.pathname === '/graph') {
                        handleToggle('main', false);
                      } else {
                        handleTogglePage('Graph', true);
                        SetApplication("graph");
                        await Reset();
                      }
                    }}
                  >
                      Graph
                    </Button>
                  </Link>

                  <Button className="manudrawerSubButtons" onClick={() => handleToggle('structures', true)}>
                    Structures
                  </Button>
                  {/* Return to HomePage */}
                  <Link to="/" className="link-button">
                    <Button
                      className="manudrawerSubButtons"
                      onClick={async () => {
                        setShow({ main: false, tree: false, sorts: false, Graph: false, structures: false });
                        await Reset()
                      }}
                    >
                      HomePage
                    </Button>
                  </Link>
                </Offcanvas.Body>
              </Offcanvas>

              {/* Tree Drawer */}
              <Offcanvas
                show={show.tree}
                onHide={() => handleToggle('tree', false)}
                placement="end"
                className="offcanvas"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="offcanvas-title">Tree</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Link to="/tree" className="Sub-button">
                    <Button className="manudrawerSubButtons" onClick={async () => {
                      if (location.pathname === '/tree') {
                        handleToggle('main', false);
                      } else {
                        handleTogglePage('AVL_Tree', true);
                        SetApplication("tree");
                        await Reset();
                      }
                    }}
                  >
                      AVL Tree
                    </Button>
                  </Link>
                </Offcanvas.Body>
              </Offcanvas>

              {/* Other Drawers (Sorts, Structures) */}
              <Offcanvas
                show={show.sorts}
                onHide={() => handleToggle('sorts', false)}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="title-center">Sorts</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body></Offcanvas.Body>
              </Offcanvas>

              <Offcanvas
                show={show.structures}
                onHide={() => handleToggle('structures', false)}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="title-center">Structures</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                <Link to="/array" className="Sub-button">
                    <Button className="manudrawerSubButtons" onClick={async () => {
                      if (location.pathname === '/array') {
                        handleToggle('main', false);
                      } else {
                        handleTogglePage('Array', true);
                        SetApplication("array");
                        await Reset();
                      }
                    }}
                  >
                      Array
                    </Button>
                    </Link>
                <Link to="/linkedlist" className="Sub-button">
                    <Button className="manudrawerSubButtons" onClick={async () => {
                      if (location.pathname === '/linkedlist') {
                        handleToggle('main', false);
                      } else {
                        handleTogglePage('LinkedList', true);
                        SetApplication("linkedlist");
                        await Reset();
                      }
                    }}
                  >
                      LinkedList
                    </Button>
                    </Link>
                    <Link to="/doublelinkedlist" className="Sub-button">
                    <Button className="manudrawerSubButtons" onClick={async () => {
                      if (location.pathname === '/doublelinkedlist') {
                        handleToggle('main', false);
                      } else {
                        handleTogglePage('DoubleLinkedList', true);
                        SetApplication("doublelinkedlist");
                        await Reset();
                      }
                    }}
                  >
                      Double_LinkedList
                    </Button>
                    </Link>
                </Offcanvas.Body>
              </Offcanvas>
            </Col>
          </Row>
        </Container>
        <Routes>
          <Route path="/tree" element={<TreePage setShow={setShow} />} />
          <Route path="/graph" element={<Graph setShow={setShow} />} />
          <Route path="/linkedlist" element={<LinkedList setShow={setShow}/>}/>
          <Route path="/doublelinkedlist" element={<DoubleLinkedList setShow={setShow}/>}/>
          <Route path="/array" element={<Array setShow={setShow}/>}/>
        </Routes>
      </div>
  );
}

export default App;

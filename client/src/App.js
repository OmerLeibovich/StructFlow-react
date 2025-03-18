import { useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { API } from "../src/api"; 
import TreePage from './Tree/Tree'; 
import Graph from './Graph/Graph';

function App() {
  const [show, setShow] = useState({ main: false, tree: false, sorts: false, Graph: false, structures: false });



  const Reset_AVL_Tree = async () => {
    await API.resetTree();
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
    <Router>
      <div className="background">
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
                    <Button className="manudrawerSubButtons"  onClick={async () => {
                        handleTogglePage('Graph', true);
                        API.SetApplication("graph");
                        await Reset_AVL_Tree();
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
                        await Reset_AVL_Tree();
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
                    <Button className="manudrawerSubButtons" onClick={() => {
                        handleTogglePage('AVL_Tree', true);
                        API.SetApplication("tree");
                    }}>
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
                <Offcanvas.Body></Offcanvas.Body>
              </Offcanvas>
            </Col>
          </Row>
        </Container>
        <Routes>
          <Route path="/tree" element={<TreePage setShow={setShow} />} />
          <Route path="/graph" element={<Graph setShow={setShow} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

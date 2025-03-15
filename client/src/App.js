import { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import TreePage from './Tree/Tree'; 

function App() {
  const [show, setShow] = useState({ main: false, tree: false,sorts: false,graph: false,structures: false});

  const Title = show.AVL_Tree ? "עץ AVL" : "ברוך הבא למסך הירוק!";

  useEffect(() => {
  }, [show.AVL_Tree]);


  const handleToggle = (menu, state) => setShow(prev => ({ ...prev, [menu]: state }));
  const handleTogglePage = (page, state) => {
    setShow({ AVL_Tree: false, main: false, tree: false, sorts: false,graph: false,structures: false });
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

                      <Button className="manudrawerSubButtons" onClick={() => handleToggle('graph', true)}>
                        Graph
                      </Button>

                      <Button className="manudrawerSubButtons" onClick={() => handleToggle('structures', true)}>
                        Structures
                      </Button>
                      {/*return to HomePage*/}
                      <Link to="/" className="link-button">
                      <Button className="manudrawerSubButtons" onClick={() => setShow({ main: false, tree: false, sorts: false, graph: false, structures: false })}>
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
                      <Link to="/tree">
                        <Button className="manudrawerSubButtons" onClick={() => handleTogglePage('AVL_Tree', true)}>
                          AVL Tree
                        </Button>
                      </Link>
                    </Offcanvas.Body>
                  </Offcanvas>

              {/* Sorts Drawer */}
              <Offcanvas
                  show={show.sorts}
                  onHide={() => handleToggle('sorts', false)}
                  placement="end"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="title-center">Sorts</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                  </Offcanvas.Body>
                </Offcanvas>
                 {/* graph Drawer */}
              <Offcanvas
                  show={show.graph}
                  onHide={() => handleToggle('graph', false)}
                  placement="end"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="title-center">Graph</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                  </Offcanvas.Body>
                </Offcanvas>
                 {/*structures Drawer */}
              <Offcanvas
                  show={show.structures}
                  onHide={() => handleToggle('structures', false)}
                  placement="end"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="title-center">structures</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                  </Offcanvas.Body>
                </Offcanvas>
              <h1 style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
              {Title}
              </h1>
            </Col>
          </Row>
        </Container>
        <Routes>
        <Route path="/tree" element={<TreePage setShow={setShow} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

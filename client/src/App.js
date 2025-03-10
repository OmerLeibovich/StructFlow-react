import { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import TreePage from './Tree/Tree'; // ✅ שם מעודכן

function App() {
  const [show, setShow] = useState({ main: false, tree: false });

  const Title = show.AVL_Tree ? "עץ AVL" : "ברוך הבא למסך הירוק!";

  useEffect(() => {
    // כל פעם שהמופע של show.AVL_Tree משתנה, נעדכן את כותרת הדף
  }, [show.AVL_Tree]);


  const handleToggle = (menu, state) => setShow(prev => ({ ...prev, [menu]: state }));
  const handleTogglePage = (page, state) => {
    setShow({ AVL_Tree: false, main: false, tree: false });
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
                Launch
              </Button>

              {/* Main Drawer */}
              <Offcanvas
                show={show.main}
                onHide={() => handleToggle('main', false)}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="title-center">manu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Button
                    className="manudrawerSubButtons"
                    onClick={() => handleToggle('tree', true)}
                  >
                    tree
                  </Button>

                  {/* Tree Drawer */}
                  <Offcanvas
                    show={show.tree}
                    onHide={() => handleToggle('tree', false)}
                    placement="end"
                  >
                    <Offcanvas.Header closeButton>
                      <Offcanvas.Title className="title-center">Tree</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <Link to="/tree">
                        <Button className="manudrawerSubButtons" onClick={() => handleTogglePage('AVL_Tree',true)}>Avl_Tree</Button>
                      </Link>
                    </Offcanvas.Body>
                  </Offcanvas>
                </Offcanvas.Body>
              </Offcanvas>

              <h1 style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
              {Title}
              </h1>
            </Col>
          </Row>
        </Container>

        {/* נתיבים */}
        <Routes>
        <Route path="/tree" element={<TreePage setShow={setShow} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

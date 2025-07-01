import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { Navbar, Nav, Container, Dropdown, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand className="logoo fs-4">
          SnowMow Solutions <i className="bi bi-snow ms-2"></i>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          <Nav className="ms-auto">

            <Nav.Link as={Link} to="/" className="mx-3">Home</Nav.Link>

            {/* NOT LOGGED IN */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/servicesouterview" className="mx-3">Our Services</Nav.Link>
                <Nav.Link as={Link} to="/login" className="mx-3">Login</Nav.Link>
              </>
            )}

            {/* ADMIN */}
              {user?.role === "admin" && (
                <>
                  <Nav.Link as={Link} to="/admin-dashboard" className="mx-3">
                    Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/allproviders" className="mx-3">
                    Providers
                  </Nav.Link>
                  <Nav.Link as={Link} to="/providersrequest" className="mx-3">
                    Provider Requests
                  </Nav.Link>

                  {/* Admin Profile Dropdown */}
                  <Dropdown align="end" className="mx-3">
                    <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                      <Image
                        src={user.picture || "https://via.placeholder.com/30"}
                        roundedCircle
                        width="30"
                        height="30"
                        className="me-2"
                      />
                      <span>{user.name}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.ItemText>
                        <strong>{user.name}</strong>
                        <br />
                        <small>{user.email}</small>
                      </Dropdown.ItemText>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}


            {/* CUSTOMER */}
            {user?.role === "customer" && (
                              <>
                <Nav.Link as={Link} to="/customer/mybookings" className="mx-3">My Bookings</Nav.Link>
                <Nav.Link as={Link} to="/makebooking" className="mx-3">Make a Booking</Nav.Link>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                    <Image src={user.picture} roundedCircle width="30" height="30" className="me-2" />
                    {user.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText>{user.email}</Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}

            {/* PROVIDER */}
            {user?.role === "provider" && user?.status === "approved" && (
              <>
                <Nav.Link as={Link} to="/providerdashboard" className="mx-3">Provider Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/providerbookingrequests" className="mx-3">Booking Requests</Nav.Link>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                    <Image src={user.picture} roundedCircle width="30" height="30" className="me-2" />
                    {user.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText>{user.email}</Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}

            {/* PROVIDER with Pending or Rejected */}
            {user?.role === "provider" && (user?.status === "pending" || user?.status === "rejected") && (
              <>
                <Nav.Link onClick={handleLogout} className="mx-3">
                  Return Home
                </Nav.Link>
              </>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;

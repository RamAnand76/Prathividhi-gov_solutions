import React, { useState } from "react";
import { Navbar, Nav, Button, Modal, Form, Avatar } from "react-bootstrap";
import { FaHome, FaQuestionCircle, FaUsers, FaBell, FaGlobe } from "react-icons/fa";
import { auth, db } from "./firebase";
import { useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";
import firebase from "firebase";

function Header() {
  const user = useSelector(selectUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  const handleQuestion = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);

    if (input) {
      await db.collection("questions").add({
        user: user,
        question: input,
        imageUrl: inputUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    setInput("");
    setInputUrl("");
  };

  return (
    <Navbar bg="light" expand="lg" className="header">
      <Navbar.Brand href="#home">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Quora_logo_2015.svg/250px-Quora_logo_2015.svg.png"
          alt="Logo"
          height="30"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home">
            <FaHome />
          </Nav.Link>
          <Nav.Link href="#features">
            <FaQuestionCircle />
          </Nav.Link>
          <Nav.Link href="#pricing">
            <FaUsers />
          </Nav.Link>
          <Nav.Link href="#notifications">
            <FaBell />
          </Nav.Link>
        </Nav>
        <Nav className="ml-auto">
          <Nav.Link href="#profile">
            <Avatar src={user?.photo} />
          </Nav.Link>
          <Nav.Link href="#language">
            <FaGlobe />
          </Nav.Link>
          <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>
            Add Question
          </Button>
        </Nav>
      </Navbar.Collapse>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formQuestion">
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                placeholder="Start your question with 'What', 'How', 'Why', etc."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formUrl" className="mt-3">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Optional: Include a link that gives context"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleQuestion}>
            Add Question
          </Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
}

export default Header;

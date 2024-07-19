import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, addDoc, getDocs, query, updateDoc, doc, deleteDoc, Timestamp, getDoc } from "firebase/firestore";
import { Button, Modal, Form, Card, Badge, Container, Row, Col, Navbar, Nav, InputGroup } from "react-bootstrap";
import { FaThumbsUp, FaThumbsDown, FaTrash, FaEdit, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import ProblemCard from "./ProblemCard";


function Home() {
  const [problems, setProblems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProblem, setNewProblem] = useState({ title: "", description: "" });
  const [user, setUser] = useState(null);
  const [editCommentData, setEditCommentData] = useState({ problemId: null, commentIndex: null, text: "" });
  const [commentsLimit, setCommentsLimit] = useState(3); // Limit initial comments displayed

  const [shareModalShow, setShareModalShow] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged((user) => setUser(user));
  }, []);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const q = query(collection(db, "Problems"));
    const querySnapshot = await getDocs(q);
    const problemsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProblems(problemsArray);
  };

  const handleAddProblem = async () => {
    try {
      if (user) {
        const newProblemData = {
          ...newProblem,
          author: user.email,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), // Format date as "7 July 2024"
          upvotes: 0,
          downvotes: 0,
          comments: [] // Initialize comments array for the new problem
        };
        const docRef = await addDoc(collection(db, "Problems"), newProblemData);
        setNewProblem({ title: "", description: "" });
        setShowModal(false);
        fetchProblems();
        // Redirect to the new post URL after creation (optional)
        // history.push(`/post/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error adding problem: ", error.message);
    }
  };

  const handleEditProblem = async (problemId, updatedProblem) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      await updateDoc(problemRef, updatedProblem);
      fetchProblems(); // Refresh the list of problems
    } catch (error) {
      console.error("Error editing problem: ", error.message);
    }
  };
  

  const handleVote = async (problemId, type) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      const problemIndex = problems.findIndex((p) => p.id === problemId);
      const updatedProblems = [...problems]; // Create a copy of problems state array

      // Check if user has already voted
      if (type === "upvote" && !updatedProblems[problemIndex].hasUpvoted) {
        // Increase upvotes and mark as hasUpvoted
        updatedProblems[problemIndex].upvotes++;
        updatedProblems[problemIndex].hasUpvoted = true;

        // Decrease downvotes if previously downvoted
        if (updatedProblems[problemIndex].hasDownvoted) {
          updatedProblems[problemIndex].downvotes--;
          updatedProblems[problemIndex].hasDownvoted = false;
        }
      } else if (type === "downvote" && !updatedProblems[problemIndex].hasDownvoted) {
        // Increase downvotes and mark as hasDownvoted
        updatedProblems[problemIndex].downvotes++;
        updatedProblems[problemIndex].hasDownvoted = true;

        // Decrease upvotes if previously upvoted
        if (updatedProblems[problemIndex].hasUpvoted) {
          updatedProblems[problemIndex].upvotes--;
          updatedProblems[problemIndex].hasUpvoted = false;
        }
      } else if (type === "upvote" && updatedProblems[problemIndex].hasUpvoted) {
        // Undo upvote
        updatedProblems[problemIndex].upvotes--;
        updatedProblems[problemIndex].hasUpvoted = false;
      } else if (type === "downvote" && updatedProblems[problemIndex].hasDownvoted) {
        // Undo downvote
        updatedProblems[problemIndex].downvotes--;
        updatedProblems[problemIndex].hasDownvoted = false;
      }

      // Update the problem in Firestore
      await updateDoc(problemRef, {
        upvotes: updatedProblems[problemIndex].upvotes,
        downvotes: updatedProblems[problemIndex].downvotes,
        hasUpvoted: updatedProblems[problemIndex].hasUpvoted,
        hasDownvoted: updatedProblems[problemIndex].hasDownvoted,
      });

      // Update state with the modified problems array
      setProblems(updatedProblems);
    } catch (error) {
      console.error("Error updating votes: ", error.message);
    }
  };


  const handleDelete = async (problemId) => {
    try {
      await deleteDoc(doc(db, "Problems", problemId));
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem: ", error.message);
    }
  };

  const handleAddComment = async (problemId, commentText) => {
    try {
      const user = auth.currentUser;
      const comment = {
        text: commentText,
        author: user.email,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), // Format date as "7 July 2024"
        upvotes: 0,
        downvotes: 0,
        relevanceScore: 0
      };
      const problemRef = doc(db, "Problems", problemId);
      const problemSnapshot = await getDoc(problemRef);
      if (problemSnapshot.exists()) {
        const comments = problemSnapshot.data().comments || [];
        comments.push(comment);
        await updateDoc(problemRef, { comments });
        fetchProblems();
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error adding comment: ", error.message);
    }
  };

  const handleEditComment = async () => {
    try {
      const problemRef = doc(db, "Problems", editCommentData.problemId);
      const problemSnapshot = await getDoc(problemRef);
      if (problemSnapshot.exists()) {
        let comments = problemSnapshot.data().comments || [];
        comments[editCommentData.commentIndex].text = editCommentData.text;
        await updateDoc(problemRef, { comments });
        setEditCommentData({ problemId: null, commentIndex: null, text: "" });
        fetchProblems();
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error editing comment: ", error.message);
    }
  };

  const handleDeleteComment = async (problemId, commentIndex) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      const problemSnapshot = await getDoc(problemRef);
      if (problemSnapshot.exists()) {
        let comments = problemSnapshot.data().comments || [];
        comments.splice(commentIndex, 1);
        await updateDoc(problemRef, { comments });
        fetchProblems();
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error deleting comment: ", error.message);
    }
  };

  const handleCommentVote = async (problemId, commentIndex, type) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not logged in");
        return;
      }
  
      const problemRef = doc(db, "Problems", problemId);
      const problemSnapshot = await getDoc(problemRef);
  
      if (problemSnapshot.exists()) {
        const problemData = problemSnapshot.data();
        const comments = [...problemData.comments];
        let comment = comments[commentIndex];
  
        // Initialize voting data if it doesn't exist
        if (!comment.votes) {
          comment.votes = {};
        }
  
        // Check if the user has already voted
        const userVote = comment.votes[user.uid] || { upvoted: false, downvoted: false };
  
        if (type === "upvote" && !userVote.upvoted) {
          if (userVote.downvoted) {
            comment.downvotes--;
            userVote.downvoted = false;
          }
          comment.upvotes++;
          userVote.upvoted = true;
        } else if (type === "downvote" && !userVote.downvoted) {
          if (userVote.upvoted) {
            comment.upvotes--;
            userVote.upvoted = false;
          }
          comment.downvotes++;
          userVote.downvoted = true;
        } else if (type === "upvote" && userVote.upvoted) {
          // Undo upvote
          comment.upvotes--;
          userVote.upvoted = false;
        } else if (type === "downvote" && userVote.downvoted) {
          // Undo downvote
          comment.downvotes--;
          userVote.downvoted = false;
        }
  
        // Update the user's vote in the comment
        comment.votes[user.uid] = userVote;
  
        // Calculate relevance score (example calculation)
        comment.relevanceScore = comment.upvotes - comment.downvotes;
  
        comments[commentIndex] = comment;
  
        await updateDoc(problemRef, {
          comments: comments
        });
  
        fetchProblems();
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error updating comment votes: ", error.message);
    }
  };
  

  const handleReadMore = () => {
    setCommentsLimit(commentsLimit + 3); // Increase comments limit by 3 when "Read More" is clicked
  };

  {/**Share Post */ }
  const handleShare = (problemId) => {
    const link = `${window.location.origin}/problem/${problemId}`;
    setShareLink(link);
    setShareModalShow(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      // You can add a toast notification here to inform the user that the link has been copied
      alert("Link copied to clipboard!");
    }, (err) => {
      alert('Could not copy text: ', err);
    });
  };
  {/**Share Post */ }


  return (
    <Container fluid>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">PrathiVidhi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
            <Button variant="outline-primary" onClick={() => setShowModal(true)}>
              Create Problem
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Row className="justify-content-center mt-4">
        <Col md={8}>
        {problems.map((problem) => (
          
            <ProblemCard
              problem={problem}
              user={user}
              handleVote={handleVote}
              handleDelete={handleDelete}
              handleEditProblem={handleEditProblem} // Pass the function here
              handleEditComment={handleEditComment}
              handleAddComment={handleAddComment}
              handleCommentVote={handleCommentVote}
              handleDeleteComment={handleDeleteComment}
              handleShare={handleShare}
              editCommentData={editCommentData}
              setEditCommentData={setEditCommentData}
              commentsLimit={commentsLimit}
              handleReadMore={handleReadMore}
              setProblems={setProblems}
              problems={problems}
            />
          
        ))}
            </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProblemTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter problem title"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProblemDescription" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter problem description"
                value={newProblem.description}
                onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddProblem}>
            Save Problem
          </Button>
        </Modal.Footer>
      </Modal>

      

      <Modal show={shareModalShow} onHide={() => setShareModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share this problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              value={shareLink}
              readOnly
            />
            <Button variant="outline-secondary" onClick={copyToClipboard}>
              Copy
            </Button>
          </InputGroup>
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default Home;

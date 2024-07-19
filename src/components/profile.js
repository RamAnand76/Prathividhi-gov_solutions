import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { Button, Modal, Form, Container, Row, Col, Navbar, Nav, InputGroup, Card } from "react-bootstrap";
import { FaTrash, FaEdit, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import ProblemCard from "./ProblemCard";

function Profile() {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);
  const [editCommentData, setEditCommentData] = useState({ problemId: null, commentIndex: null, text: "" });
  const [commentsLimit, setCommentsLimit] = useState(3); // Limit initial comments displayed
  const [shareModalShow, setShareModalShow] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [bio, setBio] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [bioModalShow, setBioModalShow] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [profilePictureModalShow, setProfilePictureModalShow] = useState(false);
  const [profilePictureInput, setProfilePictureInput] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged((user) => setUser(user));
  }, []);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          fetchProblems(user.email);
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("User is not logged in");
      }
    });
  };

  const fetchProblems = async () => {
    const q = query(collection(db, "Problems"));
    const querySnapshot = await getDocs(q);
    const problemsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProblems(problemsArray);
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

  const handleEditProblem = async (problemId, updatedProblem) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      await updateDoc(problemRef, updatedProblem);
      fetchProblems(); // Refresh the list of problems
    } catch (error) {
      console.error("Error editing problem: ", error.message);
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

  const handleShare = (problemId) => {
    const link = `${window.location.origin}/problem/${problemId}`;
    setShareLink(link);
    setShareModalShow(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Error copying link: ", err.message);
    });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleBioSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, { bio: bioInput });
        setUserDetails({ ...userDetails, bio: bioInput });
        setBioModalShow(false);
      } else {
        console.error("User is not logged in");
      }
    } catch (error) {
      console.error("Error saving bio: ", error.message);
    }
  };

  const handleProfilePictureSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, { profilePicture: profilePictureInput });
        setUserDetails({ ...userDetails, profilePicture: profilePictureInput });
        setProfilePictureModalShow(false);
      } else {
        console.error("User is not logged in");
      }
    } catch (error) {
      console.error("Error saving profile picture: ", error.message);
    }
  };

  return (
    <div>
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


      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md="8">
            {userDetails ? (
              <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                <div className="card-body text-center">
                  <img
                    src={userDetails.photo || "default-profile.png"}
                    className="rounded-circle mb-3"
                    alt="Profile"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  />
                  <h3 className="card-title">Welcome, {userDetails.firstName}</h3>
                  <p className="card-text">{userDetails.email}</p>
                  <p className="card-text">{userDetails.bio || "No bio available"}</p>
                  <div className="d-flex justify-content-around mb-4">
                  <Button variant="primary" className="mt-3" onClick={() => setBioModalShow(true)}>
                    Edit Bio
                  </Button>
                  <Button variant="primary" className="mt-3 ml-2" onClick={() => setProfilePictureModalShow(true)}>
                    Change Profile Picture
                  </Button>
                  <Button variant="danger" className="mt-3 ml-2" onClick={handleLogout}>
                    Logout
                  </Button>
                  </div>
                  
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <h2>My Problems</h2>
            {problems.filter(problem => problem.author === (user ? user.email : '')).map((problem) => (
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
      </Container>

      <Modal show={shareModalShow} onHide={() => setShareModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              value={shareLink}
              readOnly
            />
            <Button variant="outline-secondary" onClick={copyToClipboard}>
              Copy Link
            </Button>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShareModalShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={bioModalShow} onHide={() => setBioModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBio">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setBioModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBioSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={profilePictureModalShow} onHide={() => setProfilePictureModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProfilePicture">
              <Form.Label>Profile Picture URL</Form.Label>
              <Form.Control
                type="text"
                value={profilePictureInput}
                onChange={(e) => setProfilePictureInput(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProfilePictureModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleProfilePictureSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile;

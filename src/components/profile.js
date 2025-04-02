import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { Button, Modal, Form, Container, Row, Col, Navbar, Nav, InputGroup, Spinner } from "react-bootstrap";
import { FaUserEdit, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import ProblemCard from "./ProblemCard";

function Profile() {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);
  const [editCommentData, setEditCommentData] = useState({ problemId: null, commentIndex: null, text: "" });
  const [commentsLimit, setCommentsLimit] = useState(3);
  const [shareModalShow, setShareModalShow] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [bioModalShow, setBioModalShow] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [profilePictureModalShow, setProfilePictureModalShow] = useState(false);
  const [profilePictureInput, setProfilePictureInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProblems();
    }
  }, [user]);

  const fetchUserData = async (currentUser) => {
    try {
      const docRef = doc(db, "Users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserDetails(userData);
        setBioInput(userData.bio || "");
        setProfilePictureInput(userData.profilePicture || "");
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "Problems"));
      const querySnapshot = await getDocs(q);
      const problemsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProblems(problemsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setLoading(false);
    }
  };

  const handleVote = async (problemId, type) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      const problemIndex = problems.findIndex((p) => p.id === problemId);
      const updatedProblems = [...problems];

      if (type === "upvote" && !updatedProblems[problemIndex].hasUpvoted) {
        updatedProblems[problemIndex].upvotes++;
        updatedProblems[problemIndex].hasUpvoted = true;

        if (updatedProblems[problemIndex].hasDownvoted) {
          updatedProblems[problemIndex].downvotes--;
          updatedProblems[problemIndex].hasDownvoted = false;
        }
      } else if (type === "downvote" && !updatedProblems[problemIndex].hasDownvoted) {
        updatedProblems[problemIndex].downvotes++;
        updatedProblems[problemIndex].hasDownvoted = true;

        if (updatedProblems[problemIndex].hasUpvoted) {
          updatedProblems[problemIndex].upvotes--;
          updatedProblems[problemIndex].hasUpvoted = false;
        }
      } else if (type === "upvote" && updatedProblems[problemIndex].hasUpvoted) {
        updatedProblems[problemIndex].upvotes--;
        updatedProblems[problemIndex].hasUpvoted = false;
      } else if (type === "downvote" && updatedProblems[problemIndex].hasDownvoted) {
        updatedProblems[problemIndex].downvotes--;
        updatedProblems[problemIndex].hasDownvoted = false;
      }

      await updateDoc(problemRef, {
        upvotes: updatedProblems[problemIndex].upvotes,
        downvotes: updatedProblems[problemIndex].downvotes,
        hasUpvoted: updatedProblems[problemIndex].hasUpvoted,
        hasDownvoted: updatedProblems[problemIndex].hasDownvoted,
      });

      setProblems(updatedProblems);
    } catch (error) {
      console.error("Error updating votes: ", error.message);
    }
  };

  const handleEditProblem = async (problemId, updatedProblem) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      await updateDoc(problemRef, updatedProblem);
      fetchProblems();
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
      if (!user) return;
      
      const comment = {
        text: commentText,
        author: user.email,
        date: new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        upvotes: 0,
        downvotes: 0,
        relevanceScore: 0,
        votes: {}
      };
      
      const problemRef = doc(db, "Problems", problemId);
      const problemSnapshot = await getDoc(problemRef);
      
      if (problemSnapshot.exists()) {
        const comments = problemSnapshot.data().comments || [];
        comments.push(comment);
        await updateDoc(problemRef, { comments });
        fetchProblems();
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
      }
    } catch (error) {
      console.error("Error deleting comment: ", error.message);
    }
  };

  const handleCommentVote = async (problemId, commentIndex, type) => {
    try {
      if (!user) return;
      
      const problemRef = doc(db, "Problems", problemId);
      const problemSnapshot = await getDoc(problemRef);
      
      if (problemSnapshot.exists()) {
        const problemData = problemSnapshot.data();
        const comments = [...problemData.comments];
        let comment = comments[commentIndex];
        
        if (!comment.votes) {
          comment.votes = {};
        }
        
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
          comment.upvotes--;
          userVote.upvoted = false;
        } else if (type === "downvote" && userVote.downvoted) {
          comment.downvotes--;
          userVote.downvoted = false;
        }
        
        comment.votes[user.uid] = userVote;
        comment.relevanceScore = comment.upvotes - comment.downvotes;
        comments[commentIndex] = comment;
        
        await updateDoc(problemRef, { comments });
        fetchProblems();
      }
    } catch (error) {
      console.error("Error updating comment votes: ", error.message);
    }
  };

  const handleReadMore = () => {
    setCommentsLimit(commentsLimit + 3);
  };

  const handleShare = (problemId) => {
    const link = `${window.location.origin}/problem/${problemId}`;
    setShareLink(link);
    setShareModalShow(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => console.error("Error copying link: ", err.message));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleBioSave = async () => {
    try {
      if (!user) return;
      
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, { bio: bioInput });
      setUserDetails({ ...userDetails, bio: bioInput });
      setBioModalShow(false);
    } catch (error) {
      console.error("Error saving bio: ", error.message);
    }
  };

  const handleProfilePictureSave = async () => {
    try {
      if (!user) return;
      
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, { profilePicture: profilePictureInput });
      setUserDetails({ ...userDetails, profilePicture: profilePictureInput });
      setProfilePictureModalShow(false);
    } catch (error) {
      console.error("Error saving profile picture: ", error.message);
    }
  };

  const userProblems = problems.filter(problem => 
    problem.author === (user ? user.email : '')
  );

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation Bar */}
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
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <Row className="justify-content-center mb-5">
              <Col lg={8} md={10}>
                {userDetails ? (
                  <div className="bg-white rounded-3 shadow-sm p-4">
                    <Row>
                      <Col md={4} className="text-center mb-4 mb-md-0">
                        <div className="position-relative d-inline-block">
                          <img
                            src={userDetails.profilePicture || userDetails.photo || "/default-profile.png"}
                            className="rounded-circle mb-3 border shadow-sm"
                            alt="Profile"
                            style={{ width: "160px", height: "160px", objectFit: "cover" }}
                          />
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow-sm"
                            onClick={() => setProfilePictureModalShow(true)}
                          >
                            <FaCamera />
                          </Button>
                        </div>
                      </Col>
                      <Col md={8}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h2 className="mb-0">{userDetails.firstName} {userDetails.lastName}</h2>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={handleLogout}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaSignOutAlt /> Logout
                          </Button>
                        </div>
                        <p className="text-muted mb-3">{userDetails.email}</p>
                        <div className="border-top pt-3 mt-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-2">Bio</h6>
                              <p className="mb-0">{userDetails.bio || "No bio available"}</p>
                            </div>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => setBioModalShow(true)}
                              className="d-flex align-items-center gap-2"
                            >
                              <FaUserEdit /> Edit
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div className="text-center p-5 bg-white rounded-3 shadow-sm">
                    <p>User not found or not logged in</p>
                    <Button as={Link} to="/login" variant="primary">
                      Login
                    </Button>
                  </div>
                )}
              </Col>
            </Row>

            {/* User Problems */}
            <Row className="mb-5">
              <Col lg={12}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="mb-0">My Problems</h3>
                  <span className="badge bg-primary rounded-pill">
                    {userProblems.length} {userProblems.length === 1 ? 'Problem' : 'Problems'}
                  </span>
                </div>

                {userProblems.length > 0 ? (
                  userProblems.map((problem) => (
                    <div className="mb-4" key={problem.id}>
                      <ProblemCard
                        problem={problem}
                        user={user}
                        handleVote={handleVote}
                        handleDelete={handleDelete}
                        handleEditProblem={handleEditProblem}
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
                    </div>
                  ))
                ) : (
                  <div className="text-center p-5 bg-white rounded-3 shadow-sm">
                    <p className="mb-3 text-muted">You haven't created any problems yet</p>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowModal(true)}
                    >
                      Create Your First Problem
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </>
        )}
      </Container>

      {/* Share Modal */}
      <Modal show={shareModalShow} onHide={() => setShareModalShow(false)} centered>
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
            <Button variant="primary" onClick={copyToClipboard}>
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

      {/* Bio Edit Modal */}
      <Modal show={bioModalShow} onHide={() => setBioModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBio">
              <Form.Label>About you</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setBioModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBioSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Profile Picture Modal */}
      <Modal show={profilePictureModalShow} onHide={() => setProfilePictureModalShow(false)} centered>
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
                placeholder="Enter URL of your profile picture"
              />
              {profilePictureInput && (
                <div className="mt-3 text-center">
                  <p className="mb-2">Preview:</p>
                  <img 
                    src={profilePictureInput} 
                    alt="Profile preview" 
                    className="rounded-circle"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-profile.png";
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProfilePictureModalShow(false)}>
            Cancel
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
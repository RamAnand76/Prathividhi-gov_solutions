import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, getDocs, query, updateDoc, doc, getDoc } from "firebase/firestore";
import ProblemCard from "./ProblemCard";
import { Container, Navbar, Nav, Spinner } from "react-bootstrap";

function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [user, setUser] = useState(null);
  const [editCommentData, setEditCommentData] = useState({ problemId: null, commentIndex: null, text: "" });
  const [commentsLimit, setCommentsLimit] = useState(3);

  useEffect(() => {
    auth.onAuthStateChanged((user) => setUser(user));
  }, []);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    const docRef = doc(db, "Problems", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProblem({ id: docSnap.id, ...docSnap.data() });
    } else {
      console.log("No such document!");
    }
  };

  if (!problem) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const handleVote = async (problemId, type) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      const updatedProblem = { ...problem };

      if (type === "upvote" && !updatedProblem.hasUpvoted) {
        updatedProblem.upvotes++;
        updatedProblem.hasUpvoted = true;

        if (updatedProblem.hasDownvoted) {
          updatedProblem.downvotes--;
          updatedProblem.hasDownvoted = false;
        }
      } else if (type === "downvote" && !updatedProblem.hasDownvoted) {
        updatedProblem.downvotes++;
        updatedProblem.hasDownvoted = true;

        if (updatedProblem.hasUpvoted) {
          updatedProblem.upvotes--;
          updatedProblem.hasUpvoted = false;
        }
      } else if (type === "upvote" && updatedProblem.hasUpvoted) {
        updatedProblem.upvotes--;
        updatedProblem.hasUpvoted = false;
      } else if (type === "downvote" && updatedProblem.hasDownvoted) {
        updatedProblem.downvotes--;
        updatedProblem.hasDownvoted = false;
      }

      await updateDoc(problemRef, {
        upvotes: updatedProblem.upvotes,
        downvotes: updatedProblem.downvotes,
        hasUpvoted: updatedProblem.hasUpvoted,
        hasDownvoted: updatedProblem.hasDownvoted,
      });

      setProblem(updatedProblem);
    } catch (error) {
      console.error("Error updating votes: ", error.message);
    }
  };

  const handleAddComment = async (problemId, commentText) => {
    try {
      const user = auth.currentUser;
      const comment = {
        text: commentText,
        author: user.email,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
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
        setProblem({ ...problem, comments });
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
        setProblem({ ...problem, comments });
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error editing comment: ", error.message);
    }
  };

  const handleEditProblem = async (problemId, updatedProblem) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      await updateDoc(problemRef, updatedProblem);
      fetchProblem(); // Refresh the problem data
    } catch (error) {
      console.error("Error editing problem: ", error.message);
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
        setProblem({ ...problem, comments });
      } else {
        console.error("Problem document not found");
      }
    } catch (error) {
      console.error("Error deleting comment: ", error.message);
    }
  };

  const handleCommentVote = async (problemId, commentIndex, type) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      const updatedProblem = { ...problem };
      const comments = [...updatedProblem.comments];
      let comment = comments[commentIndex];

      if (type === "upvote" && !comment.hasUpvoted) {
        comment.upvotes++;
        comment.hasUpvoted = true;
      } else if (type === "downvote" && !comment.hasDownvoted) {
        comment.downvotes++;
        comment.hasDownvoted = true;
      }

      comment.relevanceScore = comment.upvotes - comment.downvotes;

      comments[commentIndex] = comment;

      await updateDoc(problemRef, {
        comments: comments
      });

      setProblem(updatedProblem);
    } catch (error) {
      console.error("Error updating comment votes: ", error.message);
    }
  };

  const handleReadMore = () => {
    setCommentsLimit(commentsLimit + 3);
  };

  return (
    <Container>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">PrathiVidhi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <ProblemCard
        problem={problem}
        user={user}
        handleVote={handleVote}
        handleDelete={() => {}}
        handleEditProblem={handleEditProblem}
        handleEditComment={handleEditComment}
        handleAddComment={handleAddComment}
        handleCommentVote={handleCommentVote}
        handleDeleteComment={handleDeleteComment}
        handleShare={() => {}}
        editCommentData={editCommentData}
        setEditCommentData={setEditCommentData}
        commentsLimit={commentsLimit}
        handleReadMore={handleReadMore}
        setProblems={() => {}}
        problems={[]}
      />
    </Container>
  );
}

export default ProblemDetail;

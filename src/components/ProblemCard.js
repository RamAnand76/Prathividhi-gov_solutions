import React, { useState } from "react";
import { Button, Card, Badge, Modal, Form } from "react-bootstrap";
import { FaThumbsUp, FaThumbsDown, FaTrash, FaEdit, FaShare, FaComments } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProblemCard = ({
  problem,
  user,
  handleVote,
  handleDelete,
  handleEditProblem,
  handleEditComment,
  handleAddComment,
  handleCommentVote,
  handleDeleteComment,
  handleShare,
  editCommentData,
  setEditCommentData,
  commentsLimit,
  handleReadMore,
  setProblems,
  problems
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: problem.title,
    description: problem.description,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatedProblem, setUpdatedProblem] = useState({ title: problem.title, description: problem.description });
  const [showComments, setShowComments] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    handleEditProblem(problem.id, editFormData);
    setIsEditing(false);
  };

  return (
    <Card key={problem.id} className="mb-4 shadow-sm">
      <Card.Body>
        {isEditing ? (
          <Form onSubmit={handleEditSubmit}>
            <Form.Group controlId={`editTitle-${problem.id}`}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group controlId={`editDescription-${problem.id}`} className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Save
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)} className="mt-3 ms-2">
              Cancel
            </Button>
          </Form>
        ) : (
          <>
            <Card.Title className="d-flex justify-content-between">
              <Link to={`/problem/${problem.id}`}>{problem.title}</Link>
              <small className="text-muted">{problem.date}</small>
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Posted by {problem.author}</Card.Subtitle>
            <Card.Text>{problem.description}</Card.Text>
          </>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button
              variant="outline-success"
              className="me-2 vote-btn"
              onClick={() => handleVote(problem.id, "upvote")}
            >
              <FaThumbsUp /> {problem.upvotes}
            </Button>
            <Button
              variant="outline-danger"
              className="vote-btn"
              onClick={() => handleVote(problem.id, "downvote")}
            >
              <FaThumbsDown /> {problem.downvotes}
            </Button>
          </div>
          <Badge pill bg="secondary">
            Upvotes: {problem.upvotes} | Downvotes: {problem.downvotes}
          </Badge>
          {user && (
            <div>
              <Button variant="outline-info" size="sm" className="mr-2">
                Solve
              </Button>
              {user.email === problem.author && (
                <>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="mr-2 edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit />
                  </Button>

                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(problem.id)}>
                    <FaTrash />
                  </Button>
                </>
              )}
              <Button variant="outline-primary" size="sm" onClick={() => handleShare(problem.id)}>
                <FaShare />
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          className="d-block mb-3"
          onClick={() => setShowComments(!showComments)}
        >
          <FaComments /> {showComments ? "Hide Comments" : "Show Comments"}
        </Button>

        {showComments && (
          <CommentSection
            problem={problem}
            user={user}
            handleEditComment={handleEditComment}
            handleAddComment={handleAddComment}
            handleCommentVote={handleCommentVote}
            handleDeleteComment={handleDeleteComment}
            editCommentData={editCommentData}
            setEditCommentData={setEditCommentData}
            commentsLimit={commentsLimit}
            handleReadMore={handleReadMore}
            setProblems={setProblems}
            problems={problems}
          />
        )}
      </Card.Body>

      {/* Edit Problem Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProblemTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter problem title"
                value={updatedProblem.title}
                onChange={(e) => setUpdatedProblem({ ...updatedProblem, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProblemDescription" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter problem description"
                value={updatedProblem.description}
                onChange={(e) => setUpdatedProblem({ ...updatedProblem, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </Card>
  );
};

const CommentSection = ({
  problem,
  user,
  handleEditComment,
  handleAddComment,
  handleCommentVote,
  handleDeleteComment,
  editCommentData,
  setEditCommentData,
  commentsLimit,
  handleReadMore,
  setProblems,
  problems
}) => {
  const problemURL = `/problems/${problem.id}/${encodeURIComponent(problem.title)}`;
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments ? problem.comments : problem.comments.slice(0, commentsLimit);

  return (
    <div className="comment-section" style={{ width: "100%" }}>
      {problem.comments && problem.comments.length > 0 ? (
        <>
          {visibleComments.map((comment, index) => (
            <Card key={index} className="mb-2">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    {comment.author === problem.author ? (
                      <span className="text-info">Author</span>
                    ) : (
                      <span className="text-muted">{comment.author}</span>
                    )}
                  </div>
                  {comment.author === user?.email && (
                    <div>
                      <Button
                        variant="link"
                        className="text-primary"
                        onClick={() =>
                          setEditCommentData({
                            problemId: problem.id,
                            commentIndex: index,
                            text: comment.text,
                          })
                        }
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger ms-2"
                        onClick={() => handleDeleteComment(problem.id, index)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </div>
                  )}
                </div>
                <Card.Text>{comment.text}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Button
                      variant="outline-success"
                      className="me-2 vote-btn"
                      onClick={() => handleCommentVote(problem.id, index, "upvote")}
                    >
                      <FaThumbsUp /> {comment.upvotes}
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="vote-btn"
                      onClick={() => handleCommentVote(problem.id, index, "downvote")}
                    >
                      <FaThumbsDown /> {comment.downvotes}
                    </Button>
                  </div>
                  <Badge pill bg="secondary">
                    Relevance Score: {comment.relevanceScore}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          ))}
          {problem.comments.length > commentsLimit && (
            <Button variant="link" onClick={handleReadMore} className="text-primary">
              Read More...
            </Button>
          )}
        </>
      ) : (
        <p>No comments yet.</p>
      )}

      <Button
        variant="outline-primary"
        size="sm"
        className="d-block mt-2"
        onClick={() => setShowAllComments(!showAllComments)}
      >
        <FaComments /> {showAllComments ? "Hide Comments" : "Show All Comments"}
      </Button>

      <Form className="mt-3">
        <Form.Group controlId={`commentText-${problem.id}`}>
          <Form.Label>Add a Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="Type your comment here..."
            value={problem.newComment || ""}
            onChange={(e) =>
              setProblems(
                problems.map((p) =>
                  p.id === problem.id ? { ...p, newComment: e.target.value } : p
                )
              )
            }
          />
        </Form.Group>
        <Button
          variant="primary"
          className="mt-2"
          onClick={() => {
            handleAddComment(problem.id, problem.newComment);
            setProblems(
              problems.map((p) =>
                p.id === problem.id ? { ...p, newComment: "" } : p
              )
            );
          }}
        >
          Post Comment
        </Button>
      </Form>
    </div>
  );
};


export default ProblemCard;

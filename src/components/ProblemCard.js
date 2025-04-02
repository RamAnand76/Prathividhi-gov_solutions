import React, { useState } from "react";
import { Button, Card, Badge, Modal, Form, Dropdown } from "react-bootstrap";
import { FaThumbsUp, FaThumbsDown, FaTrash, FaEdit, FaShare, FaComments, FaEllipsisV, FaWrench } from "react-icons/fa";
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
      <Card.Body className="px-4 py-3">
        <style>
          {`
            @media (max-width: 768px) {
              .interaction-row {
                flex-direction: column-reverse;
                align-items: center;
                text-align: center;
              }
              .button-group {
                margin-top: 10px;
              }
            }
            @media (min-width: 769px) {
              .interaction-row {
                justify-content: space-between;
              }
            }
          `}
        </style>

        {isEditing ? (
          <Form onSubmit={handleEditSubmit} className="my-2">
            <Form.Group controlId={`editTitle-${problem.id}`}>
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                className="mb-2"
              />
            </Form.Group>
            <Form.Group controlId={`editDescription-${problem.id}`}>
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                className="mb-3"
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="primary" type="submit">
                Save
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
              <div>
                <Card.Title className="mb-1">
                  <Link to={`/problem/${problem.id}`} className="text-decoration-none">{problem.title}</Link>
                </Card.Title>
                <small className="text-muted">{problem.date}</small>
              </div>
              {user && (
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${problem.id}`}>
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => window.alert("Solve problem functionality")}>
                      <FaWrench className="me-2" /> Solve
                    </Dropdown.Item>
                    {user.email === problem.author && (
                      <>
                        <Dropdown.Item onClick={() => setIsEditing(true)}>
                          <FaEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => handleDelete(problem.id)}
                          className="text-danger"
                        >
                          <FaTrash className="me-2" /> Delete
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
            <Card.Subtitle className="mb-2 text-muted">Posted by {problem.author}</Card.Subtitle>
            <Card.Text className="my-3">{problem.description}</Card.Text>
          </>
        )}

        <div className="d-flex flex-wrap align-items-center interaction-row gap-2 mb-3">
          <Badge pill bg="secondary" className="px-3 py-2">
            Upvotes: {problem.upvotes} | Downvotes: {problem.downvotes}
          </Badge>
          <div className="d-flex align-items-center gap-2 flex-wrap button-group">
            <Button
              variant="outline-success"
              size="sm"
              className="vote-btn d-flex align-items-center gap-1"
              onClick={() => handleVote(problem.id, "upvote")}
            >
              <FaThumbsUp /> <span>{problem.upvotes}</span>
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="vote-btn d-flex align-items-center gap-1"
              onClick={() => handleVote(problem.id, "downvote")}
            >
              <FaThumbsDown /> <span>{problem.downvotes}</span>
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComments /> <span>{problem.comments?.length || 0}</span>
            </Button>
            {user && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => handleShare(problem.id)}
                className="d-flex align-items-center gap-1"
              >
                <FaShare /> Share
              </Button>
            )}
          </div>
        </div>

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

// CommentSection remains unchanged
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
  const [showAllComments, setShowAllComments] = useState(false);
  const visibleComments = showAllComments ? problem.comments : problem.comments.slice(0, commentsLimit);

  return (
    <div className="comment-section border-top pt-3" style={{ width: "100%" }}>
      {problem.comments && problem.comments.length > 0 ? (
        <>
          {visibleComments.map((comment, index) => (
            <Card key={index} className="mb-3 border-start border-4 border-light">
              <Card.Body className="py-2 px-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    {comment.author === problem.author ? (
                      <span className="text-info fw-bold">Author</span>
                    ) : (
                      <span className="text-muted">{comment.author}</span>
                    )}
                  </div>
                  {comment.author === user?.email && (
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" size="sm" className="p-0" id={`comment-dropdown-${index}`}>
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item 
                          onClick={() => setEditCommentData({
                            problemId: problem.id,
                            commentIndex: index,
                            text: comment.text,
                          })}
                        >
                          <FaEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item 
                          className="text-danger"
                          onClick={() => handleDeleteComment(problem.id, index)}
                        >
                          <FaTrash className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
                <Card.Text className="mb-3">{comment.text}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="vote-btn d-flex align-items-center gap-1"
                      onClick={() => handleCommentVote(problem.id, index, "upvote")}
                    >
                      <FaThumbsUp /> <span>{comment.upvotes}</span>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="vote-btn d-flex align-items-center gap-1"
                      onClick={() => handleCommentVote(problem.id, index, "downvote")}
                    >
                      <FaThumbsDown /> <span>{comment.downvotes}</span>
                    </Button>
                  </div>
                  <Badge pill bg="secondary" className="px-2 py-1">
                    Relevance Score: {comment.relevanceScore}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          ))}
          {problem.comments.length > commentsLimit && !showAllComments && (
            <Button variant="link" onClick={handleReadMore} className="text-primary p-0 mb-3">
              Read More...
            </Button>
          )}
        </>
      ) : (
        <p className="text-muted fst-italic">No comments yet.</p>
      )}

      <Button
        variant="outline-primary"
        size="sm"
        className="d-flex align-items-center gap-1 mb-3"
        onClick={() => setShowAllComments(!showAllComments)}
      >
        <FaComments /> {showAllComments ? "Hide Comments" : "Show All Comments"}
      </Button>

      <Form className="mt-3">
        <Form.Group controlId={`commentText-${problem.id}`}>
          <Form.Label className="fw-bold">Add a Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Type your comment here..."
            value={problem.newComment || ""}
            onChange={(e) =>
              setProblems(
                problems.map((p) =>
                  p.id === problem.id ? { ...p, newComment: e.target.value } : p
                )
              )
            }
            className="mb-2"
          />
        </Form.Group>
        <Button
          variant="primary"
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
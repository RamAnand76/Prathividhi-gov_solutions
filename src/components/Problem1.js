import React, { useState } from "react";
import { db } from "./firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Button, Form } from "react-bootstrap";

function Problem({ problem }) {
  const [newSolution, setNewSolution] = useState("");

  const handleAddSolution = async (problemId) => {
    try {
      const problemRef = doc(db, "Problems", problemId);
      await updateDoc(problemRef, {
        solutions: arrayUnion({
          text: newSolution,
          userId: "Anonymous",
          createdAt: new Date(),
        }),
      });
      setNewSolution("");
    } catch (error) {
      console.error("Error adding solution: ", error.message);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{problem.userName}</h5>
        <p className="card-text">{problem.text}</p>
        <hr />
        <h6>Solutions:</h6>
        <ul>
          {problem.solutions.map((solution, index) => (
            <li key={index}>{solution.text}</li>
          ))}
        </ul>
        <Form className="mt-3">
          <Form.Group controlId="formSolutionText">
            <Form.Control
              type="text"
              placeholder="Add a solution"
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            className="mt-2"
            onClick={() => handleAddSolution(problem.id)}
          >
            Add Solution
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Problem;

// CAF_TRACE: task_id=TG-25-ui-page-reviews capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useState } from "react";
import { getReview, updateReview } from "../api.js";

const EMPTY_UPDATE_FORM = {
  review_id: "",
  submission_id: "",
  decision: "pending",
  findings_summary: ""
};

export default function ReviewsPage({ persona }) {
  const [lookupReviewId, setLookupReviewId] = useState("");
  const [lookupStatus, setLookupStatus] = useState("idle");
  const [lookupError, setLookupError] = useState("");
  const [reviewRecord, setReviewRecord] = useState(null);

  const [updateForm, setUpdateForm] = useState(EMPTY_UPDATE_FORM);
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [updateMessage, setUpdateMessage] = useState("");

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!lookupReviewId) {
      setLookupStatus("failure");
      setLookupError("Enter a review_id to load.");
      setReviewRecord(null);
      return;
    }
    setLookupStatus("loading");
    setLookupError("");
    try {
      const result = await getReview(lookupReviewId, persona);
      setReviewRecord(result);
      setLookupStatus("success");
      setUpdateForm({
        review_id: result.review_id || lookupReviewId,
        submission_id: result.submission_id || "",
        decision: result.decision || "pending",
        findings_summary: result.findings_summary || ""
      });
    } catch (requestError) {
      setReviewRecord(null);
      setLookupStatus("failure");
      setLookupError(requestError.message || "Review lookup failed");
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!updateForm.review_id) {
      setUpdateStatus("failure");
      setUpdateMessage("review_id is required.");
      return;
    }
    if (!updateForm.submission_id) {
      setUpdateStatus("failure");
      setUpdateMessage("submission_id is required.");
      return;
    }
    setUpdateStatus("loading");
    setUpdateMessage("");
    try {
      const updated = await updateReview(
        updateForm.review_id,
        {
          submission_id: updateForm.submission_id,
          decision: updateForm.decision,
          findings_summary: updateForm.findings_summary
        },
        persona
      );
      setReviewRecord(updated);
      setLookupReviewId(updated.review_id || updateForm.review_id);
      setLookupStatus("success");
      setUpdateStatus("success");
      setUpdateMessage(`Review updated: ${updated.review_id}`);
    } catch (requestError) {
      setUpdateStatus("failure");
      setUpdateMessage(requestError.message || "Review update failed");
    }
  };

  return (
    <section>
      <h2>Review Queue</h2>
      <p>Lookup and update review decisions using tenant-scoped AP review endpoints.</p>

      <section>
        <h3>Get review</h3>
        <form onSubmit={handleLookup}>
          <label htmlFor="review-lookup-id">Review ID</label>
          <input
            id="review-lookup-id"
            value={lookupReviewId}
            onChange={(event) => setLookupReviewId(event.target.value)}
            placeholder="rev-..."
            required
          />
          <button type="submit">Load review</button>
        </form>
        {lookupStatus === "loading" && <p>Loading review...</p>}
        {lookupStatus === "failure" && <p role="alert">Review lookup failed: {lookupError}</p>}
        {lookupStatus === "success" && reviewRecord && (
          <div>
            <p><strong>review_id:</strong> {reviewRecord.review_id}</p>
            <p><strong>submission_id:</strong> {reviewRecord.submission_id}</p>
            <p><strong>decision:</strong> {reviewRecord.decision}</p>
            <p><strong>reviewed_by:</strong> {reviewRecord.reviewed_by}</p>
            <p><strong>reviewed_at:</strong> {reviewRecord.reviewed_at}</p>
          </div>
        )}
      </section>

      <section>
        <h3>Update review</h3>
        <p>Review IDs and decision state are visible to support handoff into reports workflows.</p>
        <form onSubmit={handleUpdateSubmit}>
          <label htmlFor="review-update-id">Review ID</label>
          <input
            id="review-update-id"
            value={updateForm.review_id}
            onChange={(event) => setUpdateForm((current) => ({ ...current, review_id: event.target.value }))}
            required
          />
          <label htmlFor="review-update-submission-id">Submission ID</label>
          <input
            id="review-update-submission-id"
            value={updateForm.submission_id}
            onChange={(event) => setUpdateForm((current) => ({ ...current, submission_id: event.target.value }))}
            required
          />
          <label htmlFor="review-update-decision">Decision</label>
          <select
            id="review-update-decision"
            value={updateForm.decision}
            onChange={(event) => setUpdateForm((current) => ({ ...current, decision: event.target.value }))}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
          <label htmlFor="review-update-findings">Findings summary</label>
          <textarea
            id="review-update-findings"
            value={updateForm.findings_summary}
            onChange={(event) => setUpdateForm((current) => ({ ...current, findings_summary: event.target.value }))}
            required
          />
          <button type="submit">Update review</button>
        </form>
        {updateStatus === "loading" && <p>Submitting review update...</p>}
        {updateStatus === "success" && <p>{updateMessage}</p>}
        {updateStatus === "failure" && <p role="alert">Update failed: {updateMessage}</p>}
      </section>
    </section>
  );
}

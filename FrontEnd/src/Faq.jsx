import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";
import { buildUrl } from "./config/api";
import { isSafeUploadImageType, resolveTrustedImageUrl } from "./Security/trustedContent";

const DEFAULT_PROFILE_PICTURE = buildUrl("/default-avatar.webp");

export default function Faq() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const token = getToken();
  const isAuthenticated = Boolean(token);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await request(`/api/faq?page=1&pageSize=20`);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatusMessage(error?.message || "Failed to load FAQ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

  const handleQuestionImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isSafeUploadImageType(file.type)) {
      setStatusMessage("Please select a PNG, JPG, GIF, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage("Image is too large. Please choose one under 5MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setQuestionImageUrl(dataUrl);
      setStatusMessage("Image attached.");
    } catch (error) {
      setStatusMessage(error?.message || "Failed to process image.");
    }
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    if (!questionText.trim()) {
      setStatusMessage("Please enter a question.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Please sign in to send a question.");
      return;
    }

    try {

      await request(`/api/faq/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: questionText.trim(),
          questionImageUrl: questionImageUrl || null
        })
      });

      setQuestionText("");
      setQuestionImageUrl("");
      setStatusMessage("Question submitted.");
      await loadFaqs();
    } catch (error) {
      setStatusMessage(error?.message || "Failed to submit question.");
    }
  };

  const submitReply = async (faqId) => {
    setStatusMessage("");

    const answer = (replyDrafts[faqId] || "").trim();
    if (!answer) {
      setStatusMessage("Please enter an answer before replying.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Please sign in to reply.");
      return;
    }

    try {

      await request(`/api/faq/${faqId}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer })
      });

      setReplyDrafts((prev) => ({ ...prev, [faqId]: "" }));
      setStatusMessage("Reply posted.");
      await loadFaqs();
    } catch (error) {
      setStatusMessage(error?.message || "Failed to post reply.");
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1>Questions and Answers</h1>
        <p>
          Ask a question and help other users by replying to unanswered ones.
        </p>

        <div>
          <h3>Ask a question</h3>
          <form onSubmit={submitQuestion}>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Type your question here"
              rows={4} />











            <div>
              <label>









                Upload Screenshot
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageChange}
                  className="visually-hidden" />

              </label>
              {questionImageUrl &&
              <div>
                  <img
                  src={questionImageUrl}
                  alt="Question attachment preview" />


                  <div>
                    <button
                    type="button"
                    onClick={() => setQuestionImageUrl("")}>


                      Remove Image
                    </button>
                  </div>
                </div>
              }
            </div>
            <button type="submit">
              Send Question
            </button>
          </form>
          {!isAuthenticated && <p>Sign in to post questions and replies.</p>}
        </div>

        {statusMessage && <p>{statusMessage}</p>}

        <div>
          {isLoading && <p>Loading questions...</p>}

          {!isLoading && items.length === 0 &&
          <div>
              No questions yet.
            </div>
          }

          {!isLoading && items.map((item) => {
            const hasAnswer = Boolean(item.answer && item.answer.trim());
            const authorLabel = item.authorUserName || item.authorEmail || "Unknown author";
            const replyAuthorLabel = item.replyAuthorUserName || item.replyAuthorEmail || "Unknown replier";

            return (
              <div
                key={item.faqId}>


                <div>
                  <div>














                    {item.authorProfilePictureUrl ?
                    <img
                      src={resolveTrustedImageUrl(item.authorProfilePictureUrl, DEFAULT_PROFILE_PICTURE, buildUrl)}
                      alt="Author"

                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                      }} /> :


                    <img
                      src={DEFAULT_PROFILE_PICTURE}
                      alt="Default profile" />


                    }
                  </div>
                  <div>
                    <h3>{item.question}</h3>
                    <p>By: {authorLabel}</p>
                  </div>
                </div>
                <p>
                  Posted: {new Date(item.createdAt).toLocaleString()}
                </p>

                {item.questionImageUrl &&
                <div>
                    <img
                    src={resolveTrustedImageUrl(item.questionImageUrl, "", buildUrl)}
                    alt="Question attachment" />


                  </div>
                }

                {hasAnswer ?
                <div>
                    <div>
                      <div>















                        {item.replyAuthorProfilePictureUrl ?
                      <img
                        src={resolveTrustedImageUrl(item.replyAuthorProfilePictureUrl, DEFAULT_PROFILE_PICTURE, buildUrl)}
                        alt="Replier"

                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                        }} /> :


                      <img
                        src={DEFAULT_PROFILE_PICTURE}
                        alt="Default profile" />


                      }
                      </div>
                      <div>
                        <p>Reply</p>
                        <p>By: {replyAuthorLabel}</p>
                      </div>
                    </div>
                    <p>{item.answer}</p>
                  </div> :

                <div>
                    <p>No reply yet.</p>
                    <textarea
                    value={replyDrafts[item.faqId] || ""}
                    onChange={(event) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [item.faqId]: event.target.value
                    }))
                    }
                    placeholder="Write your reply"
                    rows={3} />










                    <button onClick={() => submitReply(item.faqId)}>
                      Reply to this question
                    </button>
                  </div>
                }
              </div>);

          })}
        </div>
      </div>
    </div>);

}

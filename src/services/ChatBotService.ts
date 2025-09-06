
const metadataServiceURL = "http://localhost:8000/";
export async function chatBotService(
  history: string,
  userQuery: string,
  sessionSummaries: string[],
  askedPhqIds: number[]
): Promise<{
  response: string;
  phq9_questionID: number | null;
  phq9_question: string | null;
}> {
  try {
    const response = await fetch(`${metadataServiceURL}ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_query: userQuery,
        history: history,
        summaries: sessionSummaries,
        asked_phq_ids: askedPhqIds
      }),
    });

    const data = await response.json();
    console.log("Backend ask response:", data);
    return {
      response: data.response,
      phq9_questionID: data.phq9_questionID ?? null,
      phq9_question: data.phq9_question ?? null
    };
  } catch (error) {
    console.error("chatBotService error:", error);
    return {
      response: "Sorry, something went wrong.",
      phq9_questionID: null,
      phq9_question: null
    };
  }
}

export async function profileDetailsService(
  virtualName: string,
  character: string,
  inputMethod: string
): Promise<any> {
  try {
    const res = await fetch(`${metadataServiceURL}user/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ virtualName, character, inputMethod }),
    });

    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error submitting virtual login:", error);
  }
}



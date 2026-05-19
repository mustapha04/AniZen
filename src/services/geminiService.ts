export async function getAiSummary(animeTitle: string, synopsis: string) {
  const res = await fetch("/api/gemini/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animeTitle, synopsis }),
  });
  const data = await res.json();
  return data.summary as string;
}

export async function getAiRecommendations(animeTitle: string, genres: string) {
  const res = await fetch("/api/gemini/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animeTitle, genres }),
  });
  const data = await res.json();
  return data.recommendations as string;
}

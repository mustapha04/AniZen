const BASE_URL = "https://api.jikan.moe/v4";

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  score: number;
  synopsis: string;
  episodes: number;
  status: string;
  genres: Array<{ name: string }>;
  year: number;
  season: string;
}

export async function getTopAnime() {
  const res = await fetch(`${BASE_URL}/top/anime`);
  const data = await res.json();
  return (data.data || []) as Anime[];
}

export async function getRecentAnime() {
  const res = await fetch(`${BASE_URL}/seasons/now`);
  const data = await res.json();
  return (data.data || []) as Anime[];
}

export async function getAnimeById(id: number) {
  const res = await fetch(`${BASE_URL}/anime/${id}/full`);
  const data = await res.json();
  return data.data as Anime;
}

export interface SearchOptions {
  q?: string;
  genres?: string;
  season?: string;
  year?: string;
  status?: string;
  rating?: string;
  min_score?: string;
  order_by?: string;
  sort?: string;
}

export async function searchAnime(options: SearchOptions | string) {
  let url = `${BASE_URL}/anime?limit=24`;
  
  if (typeof options === "string") {
    url += `&q=${options}`;
  } else {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    const queryString = params.toString();
    if (queryString) url += `&${queryString}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return (data.data || []) as Anime[];
}

export async function getAnimeCharacters(id: number) {
  const res = await fetch(`${BASE_URL}/anime/${id}/characters`);
  const data = await res.json();
  return data.data || [];
}

export async function getAnimeRecommendations(id: number) {
  const res = await fetch(`${BASE_URL}/anime/${id}/recommendations`);
  const data = await res.json();
  return data.data || [];
}

export async function getGenres() {
  const res = await fetch(`${BASE_URL}/genres/anime`);
  const data = await res.json();
  return data.data || [];
}

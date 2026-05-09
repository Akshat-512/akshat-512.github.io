import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.LASTFM_API_KEY;
const user = process.env.LASTFM_USER || "Z512";
const period = process.env.LASTFM_PERIOD || "1month";
const limit = Number(process.env.LASTFM_LIMIT || 12);
const output = process.env.LASTFM_OUTPUT || "static/lastfm/artists-month.json";
const placeholderImageId = "2a96cbd8b46e442fc41c2b86b821562f";

if (!apiKey) {
  console.error("Missing LASTFM_API_KEY.");
  process.exit(1);
}

function lastImage(images) {
  if (!Array.isArray(images)) {
    return "";
  }

  return [...images].reverse().find((item) => item["#text"])?.["#text"] || "";
}

async function getOpenGraphImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return "";
    }

    const html = await response.text();
    return html.match(/<meta property="og:image"\s+content="([^"]+)"/)?.[1] || "";
  } catch {
    return "";
  }
}

function usableImage(url) {
  if (!url || url.includes(placeholderImageId)) {
    return "";
  }

  return url;
}

const params = new URLSearchParams({
  method: "user.getTopArtists",
  user,
  api_key: apiKey,
  format: "json",
  period,
  limit: String(limit),
});

const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);

if (!response.ok) {
  throw new Error(`Last.fm request failed: ${response.status} ${response.statusText}`);
}

const data = await response.json();
const artists = data?.topartists?.artist || [];
const outputArtists = [];

for (const artist of artists) {
  const name = artist.name || "";
  const url = artist.url || "";

  if (!name || !url) {
    continue;
  }

  let image = usableImage(lastImage(artist.image));
  if (!image) {
    image = usableImage(await getOpenGraphImage(url));
  }

  outputArtists.push({
    name,
    plays: Number(artist.playcount || 0),
    url,
    image,
  });

  if (outputArtists.length >= 8) {
    break;
  }
}

if (outputArtists.length === 0) {
  throw new Error("No Last.fm artists found.");
}

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(
  output,
  `${JSON.stringify(
    {
      user,
      period,
      generated_at: new Date().toISOString(),
      artists: outputArtists,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${outputArtists.length} Last.fm artists to ${output}`);

import type { APIRoute } from "astro";

const REPO = "Brunogarcia03/dandelion";
const FILE_PATH = "src/data/youtube-videos.json";

async function commitFile(contentObj: any) {
  const token = import.meta.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  let sha: string | undefined;

  const current = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (current.ok) {
    const json = await current.json();
    sha = json.sha;
  }

  const content = Buffer.from(JSON.stringify(contentObj, null, 2)).toString(
    "base64",
  );

  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "update youtube videos",
      content,
      sha,
    }),
  });
}

export const GET: APIRoute = async ({ request }) => {
  if (
    request.headers.get("authorization") !==
    `Bearer ${import.meta.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const API_KEY = import.meta.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID;

    // 1️⃣ Obtener uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`,
    );

    const channelData = await channelRes.json();

    const uploadsId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2️⃣ Obtener últimos videos
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=6&playlistId=${uploadsId}&key=${API_KEY}`,
    );

    const playlistData = await playlistRes.json();

    const videoIds = playlistData.items.map(
      (item: any) => item.snippet.resourceId.videoId,
    );

    // 3️⃣ Obtener stats batch
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(
        ",",
      )}&key=${API_KEY}`,
    );

    const videosData = await videosRes.json();

    const payload = {
      updatedAt: new Date().toISOString(),
      videos: videosData.items.map((v: any) => ({
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        views: Number(v.statistics.viewCount || 0),
        likes: Number(v.statistics.likeCount || 0),
        comments: Number(v.statistics.commentCount || 0),
      })),
    };

    await commitFile(payload);

    return new Response(JSON.stringify(payload), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed updating videos", { status: 500 });
  }
};

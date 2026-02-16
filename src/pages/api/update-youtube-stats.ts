import type { APIRoute } from "astro";

const REPO = "Brunogarcia03/dandelion";
const FILE_PATH = "src/data/youtube-stats.json";

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
      message: "update youtube stats",
      content,
      sha,
    }),
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (
    request.headers.get("authorization") !==
    `Bearer ${import.meta.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${import.meta.env.YOUTUBE_CHANNEL_ID}&key=${import.meta.env.YOUTUBE_API_KEY}`,
  );

  const data = await res.json();
  const s = data.items[0].statistics;

  const payload = {
    views: Number(s.viewCount),
    subs: Number(s.subscriberCount),
    videos: Number(s.videoCount),
    updatedAt: new Date().toISOString(),
  };

  await commitFile(payload);

  return new Response(JSON.stringify(payload), { status: 200 });
};

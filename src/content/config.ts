import { defineCollection, z } from "astro:content";

const videos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    videoId: z.string(),
    views: z.number(),
  }),
});

const youtubeChannel = defineCollection({
  type: "data",
  schema: z.object({
    views: z.number(),
    subs: z.number(),
    videos: z.number(),
  }),
});

const noticias = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subtitulo: z.string(),
    date: z.date(),
    imagen: z.string(),
    body: z.string().optional(),
  }),
});

export const collections = {
  noticias,
  videos,
  youtubeChannel,
};

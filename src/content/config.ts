import { defineCollection, z } from "astro:content";

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
};

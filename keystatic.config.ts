import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "github",
    repo: {
      owner: "Brunogarcia03",
      name: "dandelion",
    },
  },

  collections: {
    noticias: collection({
      label: "Noticias",
      slugField: "title",

      path: "src/content/noticias/*",

      format: {
        contentField: "body",
      },

      schema: {
        title: fields.slug({
          name: {
            label: "Título",
          },
        }),

        subtitulo: fields.text({
          label: "Subtítulo",
        }),

        date: fields.date({
          label: "Fecha",
          defaultValue: { kind: "today" },
        }),

        imagen: fields.image({
          label: "Imagen",
          directory: "public/uploads/noticias",
          publicPath: "/uploads/noticias",
        }),

        body: fields.markdoc({
          label: "Contenido",
          options: {
            image: {
              directory: "public/uploads/noticias",
              publicPath: "/uploads/noticias",
            },
          },
        }),
      },
    }),
  },
});

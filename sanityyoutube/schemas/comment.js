// once here is done, import it to schema.js
export default {
  name: "comment",
  type: "document",
  title: "Comment",
  fields: [
    {
      name: "name",
      type: "string",
    },
    {
      title: "Approved",
      name: "approved",
      type: "boolean",
      description: "Comments won't show on the site without approval",
    },
    {
      name: "email",
      type: "string",
    },
    {
      name: "comment",
      type: "text",
    },
    // a post reference to an exisiting blog
    {
      name: "post",
      type: "reference",
      to: [{ type: "post" }],
    },
  ],
};

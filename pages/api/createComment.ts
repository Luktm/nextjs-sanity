// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import sanityClient from "@sanity/client";
import type { NextApiRequest, NextApiResponse } from "next";

// set sanity config
export const config = {
  /**
   * Find your project ID and dataset in `sanity.json` in your studio project.
   * These are considered “public”, but you can use environment variables
   * if you want differ between local dev and production.
   *
   * https://nextjs.org/docs/basic-features/environment-variables
   **/
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  /**
   * Set useCdn to `false` if your application require the freshest possible
   * data always (potentially slightly slower and a bit more expensive).
   * Authenticated request (like preview) will always bypass the CDN
   **/
  useCdn: process.env.NODE_ENV === "production",
  // got sanity.io, open into the project -> API tab -> got to Tokens -> Add API token -> Give a name -> Select Editor option
  token: process.env.SANITY_API_TOKEN, // token is protected zone security with sanity db
};

// npm i @sanity/client, it work for node environment
const client = sanityClient(config);

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body);

  try {
    // create following document in sanity
    await client.create({
      // point to `comment` database
      _type: "comment",
      post: {
        _type: "reference",
        _ref: _id,
      },
      name,
      email,
      comment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Couldn't submit comment", error: error });
  }

  console.log("Comment submitted");
  return res.status(200).json({ message: "Comment submitted" });
}

import React, { useState } from "react";
import { sanityClient, urlFor } from "../../sanity";
import { GetStaticPaths, GetStaticProps } from "next";
import { Post } from "../../typings";
import Header from "../../components/Header";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

export default function PostDetail({ post }: Props): JSX.Element {
  const [submitted, setSubmitted] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((_) => {
        console.log(data);
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(false);
      });
  };

  return (
    <main>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog Post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <PortableText
            // get `dataset` and `projectId` from sanity.json, but it config in .env.local
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h1 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ children }: any) => (
                <a className="hover-underline text-blue-500">{children}</a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="mx-w-lg my-5 mx-auto border border-yellow-500" />

      {submitted ? (
        <div className="my-10 flex flex-col bg-yellow-500 py-10 text-white">
          <h3 className="text-3xl font-bold">
            Thank you for submitting your comment!
          </h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>

          <hr className="mt-2 py-3" />

          {/* add `...register("key")` to input attribute, so it can connect to react hook form */}
          <input
            {...register("_id", { required: true })}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="mb-5 block ">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="form-input css mt-1 w-full rounded border py-2 px-3  shadow outline-none ring-yellow-500 focus:ring"
              placeholder="john Applesed"
              type="text"
              name="name"
            />
          </label>

          <label className="mb-5 block ">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring"
              placeholder="john Applesed"
              type="email"
              name="email"
            />
          </label>

          <label className="mb-5 block ">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="boder form-textarea mt-1 block w-full rounded py-2 px-3 shadow outline-none ring-yellow-500 focus:ring"
              placeholder="john Applesed"
              rows={8}
              name="comment"
            />
          </label>
          {/* errors will return when field validation fails */}
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">- The Name Field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                - The Comment Field is required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                - The Email Field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="focus:shadow-outline cursor-pointer rounded bg-yellow-500 py-2 px-4 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none"
          />
        </form>
      )}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const query = `
    *[_type == "post"] {
        _id,
        slug {
         current
        }
    }
  `;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths: paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // at line 52 it passing slug get from query parameter $slug varable in line 37
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
        _id,
        _createdAt,
        title,
        author -> {
            name,
            image,
        },
        description,
        image,
        slug,
        body,
        mainImage,
    }`;

  const post = await sanityClient.fetch(query, {
    // params.slug is get from index.tsx at line 49 `/post/${post.slug.current}`
    // passing url slug to link 37 $slug variable
    slug: params?.slug,
  });

  if (!!post === false) {
    return {
      // if we retur notFound: true, it give user 404 page
      notFound: true,
    };
  }

  return {
    props: {
      post: post,
    },
    revalidate: 60, // after 60 seconds, it'll update the old cached version
  };
};

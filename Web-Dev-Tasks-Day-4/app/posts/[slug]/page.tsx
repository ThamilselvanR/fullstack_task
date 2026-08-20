import { notFound } from "next/navigation";
import Link from "next/link";
import posts from "@/data/posts.json";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — blog`,
    description: post.excerpt,
  };
}

export default async function PostPage({
  params,
}: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Render simple markdown-like line breaks
  const paragraphs = post.content.split("\n\n");

  return (
    <article>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-8"
      >
        ← Back to all posts
      </Link>

      {/* Post header */}
      <header className="mb-8">
        <time className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {/* Divider */}
      <hr className="border-zinc-200 dark:border-zinc-800 mb-8" />

      {/* Post content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {paragraphs.map((para, i) => {
          if (para.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8"
              >
                {para.replace("## ", "")}
              </h2>
            );
          }
          if (para.startsWith("```")) {
            const code = para.replace(/```[a-z]*/g, "").trim();
            return (
              <pre
                key={i}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 overflow-x-auto text-sm font-mono"
              >
                <code>{code}</code>
              </pre>
            );
          }
          return <p key={i}>{para}</p>;
        })}
      </div>
    </article>
  );
}

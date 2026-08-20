import Link from "next/link";
import posts from "@/data/posts.json";

export default function Home() {
  return (
    <section>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Welcome to blog
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          A cozy corner of the internet for curious minds.
        </p>
      </div>

      {/* Posts list */}
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <Link href={`/posts/${post.slug}`} className="block">
              <time
                dateTime={post.date}
                className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider"
              >
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-50 gap-1 group-hover:gap-2 transition-all">
                Read more <span aria-hidden="true">→</span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}


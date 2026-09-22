import { Link } from "react-router-dom";
import { BLOG_FITLENS_HOOK } from "@/content/blog-fitlens-hook";

const BlogFitLensHook = () => (
  <aside className="blog-fitlens-hook" aria-labelledby="blog-fitlens-hook-title">
    <div>
      <h2 id="blog-fitlens-hook-title">{BLOG_FITLENS_HOOK.title}</h2>
      <p>{BLOG_FITLENS_HOOK.body}</p>
    </div>
    <Link to={BLOG_FITLENS_HOOK.href}>{BLOG_FITLENS_HOOK.label}</Link>
  </aside>
);

export default BlogFitLensHook;
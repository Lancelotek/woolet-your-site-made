import { Link } from "react-router-dom";

const BlogFitLensHook = () => (
  <aside className="blog-fitlens-hook" aria-labelledby="blog-fitlens-hook-title">
    <div>
      <h2 id="blog-fitlens-hook-title">Know your size in 20 seconds</h2>
      <p>Your phone camera measures your face width and matches you to a frame. Free, no signup.</p>
    </div>
    <Link to="/en/fit">Measure my face</Link>
  </aside>
);

export default BlogFitLensHook;
import { Link, Navigate, useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import { formatDate, getPost } from '../lib/posts'
import './Articles.css'

export const Article = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) return <Navigate to='/articles' replace />;

  return (
    <article className="container">
      <Link to='/articles' className="post-back">← All articles</Link>
      <h1>{post.title}</h1>
      <div className="post-meta">
        {post.date && !post.dateInBody && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        {post.tags?.map((tag) => <span key={tag} className="post-tag">#{tag}</span>)}
      </div>
      <div className="post-body">
        <Markdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
        >
          {post.content}
        </Markdown>
      </div>
    </article>
  );
}

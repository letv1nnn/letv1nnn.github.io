import { Link } from 'react-router-dom'
import { formatDate, getAllPosts } from '../lib/posts'
import './Articles.css'

export const Articles = () => {
  const posts = getAllPosts();

  return (
    <div className="container">
      <h1>Articles</h1>
      <p>I'm posting articles here. Most of them are going to be related to Rust, CS, Maths and something else.</p>

      {posts.length === 0 ? (
        <p>Nothing has been posted yet...</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/articles/${post.slug}`} className="post-card">
                <div className="post-card-header">
                  <h3>{post.title}</h3>
                  {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
                </div>
                {post.description && <p>{post.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

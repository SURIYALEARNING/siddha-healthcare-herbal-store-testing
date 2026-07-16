import state from '../data/index.js';
import { getLoggedUser } from '../services/authHelper.js';

export function getBlogs(req, res) {
  res.json(state.blogs);
}

export function addBlog(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege demanded." });

  const { title, content, category, author, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Title, content, and category are required parameters." });
  }

  const newBlog = {
    id: "blog-" + (state.blogs.length + 1),
    title,
    content,
    category,
    author: author || "Dr. S. Thirugnanasambandar, B.S.M.S",
    date: new Date().toISOString().split("T")[0],
    image: image || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    reads: 0
  };

  state.blogs.push(newBlog);
  res.status(201).json({ message: "Blog article published!", blog: newBlog });
}

export function updateBlog(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const blog = state.blogs.find(b => b.id === req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not located." });

  const { title, content, category, author, image } = req.body;
  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.category = category || blog.category;
  blog.author = author || blog.author;
  blog.image = image || blog.image;

  res.json({ message: "Blog modified successfully!", blog });
}

export function deleteBlog(req, res) {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  state.blogs = state.blogs.filter(b => b.id !== req.params.id);
  res.json({ message: "Blog removed successfully." });
}

export function incrementBlogReads(req, res) {
  const blog = state.blogs.find(b => b.id === req.params.id);
  if (blog) {
    blog.reads += 1;
    res.json({ reads: blog.reads });
  } else {
    res.status(404).json({ error: "Blog not found." });
  }
}

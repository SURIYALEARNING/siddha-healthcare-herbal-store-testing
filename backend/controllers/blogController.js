import Blog from '../models/Blog.js';

export async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs." });
  }
}

export async function addBlog(req, res) {
  try {
    const { title, content, category, author, image } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: "Title, content, and category are required." });
    }

    const blog = await Blog.create({
      title, content, category,
      author: author || "Dr. S. Thirugnanasambandar, B.S.M.S",
      image: image || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    });

    res.status(201).json({ message: "Blog article published!", blog });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog." });
  }
}

export async function updateBlog(req, res) {
  try {
    const { title, content, category, author, image } = req.body;
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (category) updateFields.category = category;
    if (author) updateFields.author = author;
    if (image) updateFields.image = image;

    const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
    if (!blog) return res.status(404).json({ error: "Blog not found." });

    res.json({ message: "Blog modified successfully!", blog });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog." });
  }
}

export async function deleteBlog(req, res) {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    res.json({ message: "Blog removed successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog." });
  }
}

export async function incrementBlogReads(req, res) {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { reads: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    res.json({ reads: blog.reads });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog reads." });
  }
}

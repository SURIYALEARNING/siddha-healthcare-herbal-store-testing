import Blog, { BlogCategory } from '../models/Blog.js';

export async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs." });
  }
}

export async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog." });
  }
}

export async function addBlog(req, res) {
  try {
    const { title, content, category, author, image, images } = req.body;
    if (!title || !title.en || !content || !content.en || !category) {
      return res.status(400).json({ error: "Title (English), content (English), and category are required." });
    }

    const blogImages = images && images.length > 0
      ? images.filter(Boolean)
      : (image ? [image] : []);

    const blog = await Blog.create({
      title: { en: title.en || "", ta: title.ta || "" },
      content: { en: content.en || "", ta: content.ta || "" },
      category,
      author: author || "Dr. S. Thirugnanasambandar, B.S.M.S",
      image: blogImages[0] || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
      images: blogImages,
    });

    res.status(201).json({ message: "Blog article published!", blog });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog." });
  }
}

export async function updateBlog(req, res) {
  try {
    const { title, content, category, author, image, images } = req.body;
    const updateFields = {};
    if (title && title.en) updateFields.title = { en: title.en, ta: title.ta || "" };
    if (content && content.en) updateFields.content = { en: content.en, ta: content.ta || "" };
    if (category) updateFields.category = category;
    if (author) updateFields.author = author;

    if (images && images.length > 0) {
      const filtered = images.filter(Boolean);
      updateFields.images = filtered;
      updateFields.image = filtered[0];
    } else if (image) {
      updateFields.image = image;
      updateFields.images = [image];
    }

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

export async function getBlogCategories(req, res) {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog categories." });
  }
}

export async function addBlogCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required." });
    }
    const existing = await BlogCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.json(existing);
    }
    const category = await BlogCategory.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog category." });
  }
}

export async function deleteBlogCategory(req, res) {
  try {
    const category = await BlogCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found." });
    res.json({ message: "Category deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog category." });
  }
}

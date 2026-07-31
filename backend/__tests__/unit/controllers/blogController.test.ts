import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as blogController from '../../../controllers/blogController.js';
import { createTestBlog } from '../../helpers/factories';

function mockReq(overrides: any = {}) {
  return {
    params: {},
    body: {},
    query: {},
    user: null,
    ...overrides,
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('blogController', () => {
  beforeEach(async () => {
    // clean state handled by setup.ts afterEach
  });

  describe('getBlogs', () => {
    it('should return all blogs sorted by newest', async () => {
      await createTestBlog({ title: 'Blog A' });
      await createTestBlog({ title: 'Blog B' });

      const req = mockReq();
      const res = mockRes();

      await blogController.getBlogs(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Blog A' }),
          expect.objectContaining({ title: 'Blog B' }),
        ]),
      );
    });

    it('should return empty array when no blogs exist', async () => {
      const req = mockReq();
      const res = mockRes();

      await blogController.getBlogs(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      const orig = mongoose.Model.find;
      vi.spyOn(mongoose.Model, 'find').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await blogController.getBlogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch blogs.' });

      vi.restoreAllMocks();
    });
  });

  describe('addBlog', () => {
    it('should return 400 if title is missing', async () => {
      const req = mockReq({
        body: { content: 'Content', category: 'Health' },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title, content, and category are required.',
      });
    });

    it('should return 400 if content is missing', async () => {
      const req = mockReq({
        body: { title: 'Title', category: 'Health' },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if category is missing', async () => {
      const req = mockReq({
        body: { title: 'Title', content: 'Content' },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create a blog and return 201 with defaults', async () => {
      const req = mockReq({
        body: { title: 'New Blog', content: 'Great content', category: 'Wellness' },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Blog article published!',
          blog: expect.objectContaining({
            title: 'New Blog',
            content: 'Great content',
            category: 'Wellness',
            author: 'Dr. S. Thirugnanasambandar, B.S.M.S',
          }),
        }),
      );
    });

    it('should use custom author and image when provided', async () => {
      const req = mockReq({
        body: {
          title: 'Custom Blog',
          content: 'Content',
          category: 'Health',
          author: 'Dr. John',
          image: 'https://example.com/custom.jpg',
        },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          blog: expect.objectContaining({
            author: 'Dr. John',
            image: 'https://example.com/custom.jpg',
          }),
        }),
      );
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'create').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({
        body: { title: 'Title', content: 'Content', category: 'Health' },
      });
      const res = mockRes();

      await blogController.addBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('updateBlog', () => {
    it('should update a blog and return 200', async () => {
      const blog = await createTestBlog();

      const req = mockReq({
        params: { id: blog._id.toString() },
        body: { title: 'Updated Title', content: 'Updated content' },
      });
      const res = mockRes();

      await blogController.updateBlog(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Blog modified successfully!',
          blog: expect.objectContaining({
            title: 'Updated Title',
            content: 'Updated content',
          }),
        }),
      );
    });

    it('should return 404 if blog not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { title: 'Updated' },
      });
      const res = mockRes();

      await blogController.updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Blog not found.' });
    });

    it('should only update provided fields', async () => {
      const blog = await createTestBlog({ title: 'Original', content: 'Original' });

      const req = mockReq({
        params: { id: blog._id.toString() },
        body: { title: 'Only Title Updated' },
      });
      const res = mockRes();

      await blogController.updateBlog(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          blog: expect.objectContaining({
            title: 'Only Title Updated',
            content: 'Original',
          }),
        }),
      );
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { title: 'Test' },
      });
      const res = mockRes();

      await blogController.updateBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteBlog', () => {
    it('should delete a blog and return 200', async () => {
      const blog = await createTestBlog();

      const req = mockReq({ params: { id: blog._id.toString() } });
      const res = mockRes();

      await blogController.deleteBlog(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Blog removed successfully.' });
    });

    it('should return 404 if blog not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await blogController.deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Blog not found.' });
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await blogController.deleteBlog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('incrementBlogReads', () => {
    it('should increment reads and return the count', async () => {
      const blog = await createTestBlog({ reads: 5 });

      const req = mockReq({ params: { id: blog._id.toString() } });
      const res = mockRes();

      await blogController.incrementBlogReads(req, res);

      expect(res.json).toHaveBeenCalledWith({ reads: 6 });
    });

    it('should return 404 if blog not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await blogController.incrementBlogReads(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await blogController.incrementBlogReads(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
